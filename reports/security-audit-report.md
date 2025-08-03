
# 安全性审查报告

## 总体安全状态: 🚨 VULNERABLE

## 问题统计

| 级别 | 数量 | 说明 |
|------|------|------|
| 🔴 关键 | 1615 | 需要立即修复的严重安全漏洞 |
| 🟡 高风险 | 260 | 高优先级安全问题 |
| 🟠 中风险 | 231 | 中等优先级安全问题 |
| 🔵 低风险 | 167 | 建议修复的安全问题 |
| ℹ️ 信息 | 1 | 安全信息和建议 |
| **总计** | **2274** | **发现的问题总数** |

## 详细问题清单

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/BatchExportManager.ts 第 123 行发现可疑模式: ${error.message}
- **文件**: extension/export/BatchExportManager.ts
- **行号**: 123
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/BatchExportManager.ts 第 297 行发现可疑模式: ${config.splitBy}
- **文件**: extension/export/BatchExportManager.ts
- **行号**: 297
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/BatchExportManager.ts 第 460 行发现可疑模式: ${index}
- **文件**: extension/export/BatchExportManager.ts
- **行号**: 460
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/BatchExportManager.ts 第 460 行发现可疑模式: ${Date.now()}
- **文件**: extension/export/BatchExportManager.ts
- **行号**: 460
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/BatchExportManager.ts 第 461 行发现可疑模式: ${index + 1}
- **文件**: extension/export/BatchExportManager.ts
- **行号**: 461
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/BatchExportManager.ts 第 498 行发现可疑模式: ${index + 1}
- **文件**: extension/export/BatchExportManager.ts
- **行号**: 498
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/BatchExportManager.ts 第 532 行发现可疑模式: ${interval}
- **文件**: extension/export/BatchExportManager.ts
- **行号**: 532
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/BatchExportManager.ts 第 774 行发现可疑模式: ${Date.now()}
- **文件**: extension/export/BatchExportManager.ts
- **行号**: 774
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/BatchExportManager.ts 第 774 行发现可疑模式: ${Math.random().toString(36).substr(2, 9)}
- **文件**: extension/export/BatchExportManager.ts
- **行号**: 774
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/BatchExportManager.ts 第 135 行发现可疑模式: ', taskId);
    }
  }

  /**
   * 获取批量导出状态
   * @param taskId 任务ID
   * @returns 任务状态
   */
  getBatchExportStatus(taskId: string): BatchExportTask | null {
    return this.activeTasks.get(taskId) || null;
  }

  /**
   * 注册进度回调
   * @param callback 进度回调函数
   */
  onProgress(callback: (progress: BatchExportProgress) => void): void {
    this.progressCallbacks.add(callback);
  }

  /**
   * 移除进度回调
   * @param callback 进度回调函数
   */
  offProgress(callback: (progress: BatchExportProgress) => void): void {
    this.progressCallbacks.delete(callback);
  }

  /**
   * 执行批量导出任务
   * @param task 批量导出任务
   */
  private async executeBatchExport(task: BatchExportTask): Promise<void> {
    const startTime = performance.now();
    
    try {
      for (let i = 0; i < task.batches.length; i++) {
        if (task.cancelled) {
          throw new ExportError('
- **文件**: extension/export/BatchExportManager.ts
- **行号**: 135
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/BatchExportManager.ts 第 309 行发现可疑模式: ');
    
    // 假设第一列是时间戳
    const records = Array.isArray(data.records) ? data.records : [];
    if (records.length === 0) return batches;
    
    let currentBatch: any[] = [];
    let currentStartTime: Date | null = null;
    let batchIndex = 0;
    
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const timestamp = new Date(record[0]);
      
      if (!currentStartTime) {
        currentStartTime = timestamp;
      }
      
      // 检查是否需要创建新批次
      if (timestamp.getTime() - currentStartTime.getTime() >= intervalMs) {
        if (currentBatch.length > 0) {
          batches.push(this.createBatchInfo(
            batchIndex++,
            currentBatch,
            config,
            { startTime: currentStartTime, endTime: timestamp }
          ));
        }
        
        currentBatch = [];
        currentStartTime = timestamp;
      }
      
      currentBatch.push(record);
    }
    
    // 处理最后一个批次
    if (currentBatch.length > 0) {
      batches.push(this.createBatchInfo(
        batchIndex,
        currentBatch,
        config,
        { startTime: currentStartTime, endTime: new Date(currentBatch[currentBatch.length - 1][0]) }
      ));
    }
    
    return batches;
  }

  /**
   * 按大小创建批次
   * @param data 导出数据
   * @param config 批量导出配置
   * @returns 批次数组
   */
  private createSizeBatches(data: ExportData, config: BatchExportConfig): BatchInfo[] {
    const batches: BatchInfo[] = [];
    const maxSizeBytes = (config.maxSize || 50) * 1024 * 1024; // 转换为字节
    
    const records = Array.isArray(data.records) ? data.records : [];
    if (records.length === 0) return batches;
    
    let currentBatch: any[] = [];
    let currentSize = 0;
    let batchIndex = 0;
    
    for (const record of records) {
      const recordSize = this.estimateRecordSize(record);
      
      // 检查是否需要创建新批次
      if (currentSize + recordSize > maxSizeBytes && currentBatch.length > 0) {
        batches.push(this.createBatchInfo(batchIndex++, currentBatch, config));
        currentBatch = [];
        currentSize = 0;
      }
      
      currentBatch.push(record);
      currentSize += recordSize;
    }
    
    // 处理最后一个批次
    if (currentBatch.length > 0) {
      batches.push(this.createBatchInfo(batchIndex, currentBatch, config));
    }
    
    return batches;
  }

  /**
   * 按记录数创建批次
   * @param data 导出数据
   * @param config 批量导出配置
   * @returns 批次数组
   */
  private createCountBatches(data: ExportData, config: BatchExportConfig): BatchInfo[] {
    const batches: BatchInfo[] = [];
    const maxRecords = config.maxRecords || 10000;
    
    const records = Array.isArray(data.records) ? data.records : [];
    if (records.length === 0) return batches;
    
    let batchIndex = 0;
    
    for (let i = 0; i < records.length; i += maxRecords) {
      const batchRecords = records.slice(i, i + maxRecords);
      batches.push(this.createBatchInfo(batchIndex++, batchRecords, config));
    }
    
    return batches;
  }

  /**
   * 按数据集创建批次
   * @param data 导出数据
   * @param config 批量导出配置
   * @returns 批次数组
   */
  private createDatasetBatches(data: ExportData, config: BatchExportConfig): BatchInfo[] {
    const batches: BatchInfo[] = [];
    
    // 为每个数据集创建一个批次
    data.datasets.forEach((dataset, index) => {
      const batchRecords = this.extractDatasetRecords(data, dataset.id);
      if (batchRecords.length > 0) {
        batches.push(this.createBatchInfo(index, batchRecords, config, undefined, dataset.title));
      }
    });
    
    return batches;
  }

  /**
   * 创建批次信息
   * @param index 批次索引
   * @param records 记录数组
   * @param config 批量导出配置
   * @param timeRange 时间范围
   * @param customName 自定义名称
   * @returns 批次信息
   */
  private createBatchInfo(
    index: number,
    records: any[],
    config: BatchExportConfig,
    timeRange?: { startTime: Date; endTime: Date },
    customName?: string
  ): BatchInfo {
    const fileName = this.generateBatchFileName(config, index, timeRange, customName);
    const filePath = path.join(config.outputDirectory, fileName);
    
    return {
      id: `batch_${index}_${Date.now()}`,
      name: customName || `Batch ${index + 1}`,
      filePath,
      dataRange: {
        startIndex: 0,
        endIndex: records.length - 1,
        startTime: timeRange?.startTime,
        endTime: timeRange?.endTime
      },
      estimatedSize: this.estimateBatchSize(records),
      recordCount: records.length
    };
  }

  /**
   * 生成批次文件名
   * @param config 批量导出配置
   * @param index 批次索引
   * @param timeRange 时间范围
   * @param customName 自定义名称
   * @returns 文件名
   */
  private generateBatchFileName(
    config: BatchExportConfig,
    index: number,
    timeRange?: { startTime: Date; endTime: Date },
    customName?: string
  ): string {
    let pattern = config.fileNamePattern || '
- **文件**: extension/export/BatchExportManager.ts
- **行号**: 309
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/BatchExportManager.ts 第 497 行发现可疑模式: ', String(index + 1).padStart(3, '
- **文件**: extension/export/BatchExportManager.ts
- **行号**: 497
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/BatchExportManager.ts 第 498 行发现可疑模式: ', customName || `batch${index + 1}`)
      .replace('
- **文件**: extension/export/BatchExportManager.ts
- **行号**: 498
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/BatchExportManager.ts 第 507 行发现可疑模式: ', timeRange.endTime.toISOString().slice(0, 10));
    }
    
    return pattern + extension;
  }

  /**
   * 解析时间间隔
   * @param interval 时间间隔字符串
   * @returns 毫秒数
   */
  private parseTimeInterval(interval: string): number {
    const value = parseInt(interval);
    const unit = interval.slice(-1);
    
    switch (unit) {
      case '
- **文件**: extension/export/BatchExportManager.ts
- **行号**: 507
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/BatchExportManager.ts 第 529 行发现可疑模式: ':
        return value * 1000;
      default:
        throw new ExportError(`Invalid time interval: ${interval}`);
    }
  }

  /**
   * 估算记录大小
   * @param record 记录
   * @returns 字节数
   */
  private estimateRecordSize(record: any[]): number {
    return JSON.stringify(record).length * 2; // 粗略估算，UTF-8编码
  }

  /**
   * 估算批次大小
   * @param records 记录数组
   * @returns 字节数
   */
  private estimateBatchSize(records: any[]): number {
    if (records.length === 0) return 0;
    const sampleSize = Math.min(100, records.length);
    const sampleRecords = records.slice(0, sampleSize);
    const avgSize = sampleRecords.reduce((sum, record) => sum + this.estimateRecordSize(record), 0) / sampleSize;
    return Math.round(avgSize * records.length);
  }

  /**
   * 提取数据集记录
   * @param data 导出数据
   * @param datasetId 数据集ID
   * @returns 记录数组
   */
  private extractDatasetRecords(data: ExportData, datasetId: string): any[] {
    // 这里需要根据实际数据结构来实现
    // 暂时返回所有记录的简化版本
    const records = Array.isArray(data.records) ? data.records : [];
    return records; // 实际应该过滤出特定数据集的记录
  }

  /**
   * 准备导出数据
   * @param config 导出配置
   * @returns 导出数据
   */
  private async prepareExportData(config: ExportConfig): Promise<ExportData> {
    // 这里应该调用实际的数据获取逻辑
    // 暂时返回模拟数据
    return {
      headers: ['
- **文件**: extension/export/BatchExportManager.ts
- **行号**: 529
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/BatchExportManager.ts 第 591 行发现可疑模式: '
      }
    };
  }

  /**
   * 准备批次数据
   * @param config 导出配置
   * @param batch 批次信息
   * @returns 批次数据
   */
  private async prepareBatchData(config: ExportConfig, batch: BatchInfo): Promise<ExportData> {
    const fullData = await this.prepareExportData(config);
    
    // 提取批次范围内的数据
    const records = Array.isArray(fullData.records) ? fullData.records : [];
    const batchRecords = records.slice(batch.dataRange.startIndex, batch.dataRange.endIndex + 1);
    
    return {
      ...fullData,
      records: batchRecords,
      totalRecords: batchRecords.length
    };
  }

  /**
   * 创建批次配置
   * @param baseConfig 基础配置
   * @param batch 批次信息
   * @returns 批次配置
   */
  private createBatchConfig(baseConfig: ExportConfig, batch: BatchInfo): ExportConfig {
    return {
      ...baseConfig,
      file: {
        ...baseConfig.file,
        path: batch.filePath,
        name: path.basename(batch.filePath)
      }
    };
  }

  /**
   * 报告批次进度
   * @param task 批量导出任务
   * @param batch 当前批次
   * @param stage 阶段
   * @param percentage 百分比
   */
  private reportBatchProgress(
    task: BatchExportTask,
    batch: BatchInfo,
    stage: string,
    percentage: number
  ): void {
    const completedBatches = task.results.filter(r => r.success).length;
    const failedBatches = task.results.filter(r => !r.success).length;
    const overallPercentage = ((task.currentBatch + percentage / 100) / task.totalBatches) * 100;
    
    const progress: BatchExportProgress = {
      taskId: task.id,
      batchId: batch.id,
      batchName: batch.name,
      stage: stage as any,
      percentage,
      processedRecords: 0,
      totalRecords: batch.recordCount,
      estimatedTimeRemaining: this.calculateBatchETA(task),
      currentBatch: task.currentBatch + 1,
      totalBatches: task.totalBatches,
      completedBatches,
      failedBatches,
      overallPercentage,
      currentFile: batch.filePath
    };
    
    for (const callback of this.progressCallbacks) {
      try {
        callback(progress);
      } catch (error) {
        console.error('
- **文件**: extension/export/BatchExportManager.ts
- **行号**: 591
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/BatchExportManager.ts 第 675 行发现可疑模式: ', progress);
  }

  /**
   * 计算批量导出预估时间
   * @param task 批量导出任务
   * @returns 预估剩余时间（毫秒）
   */
  private calculateBatchETA(task: BatchExportTask): number {
    if (task.currentBatch === 0) return 0;
    
    const elapsed = Date.now() - task.startTime;
    const avgTimePerBatch = elapsed / (task.currentBatch + 1);
    const remainingBatches = task.totalBatches - task.currentBatch - 1;
    
    return Math.max(0, avgTimePerBatch * remainingBatches);
  }

  /**
   * 生成批量导出报告
   * @param task 批量导出任务
   * @returns 导出报告
   */
  private generateBatchReport(task: BatchExportTask): any {
    const successful = task.results.filter(r => r.success);
    const failed = task.results.filter(r => !r.success);
    const totalDuration = Date.now() - task.startTime;
    
    return {
      taskId: task.id,
      totalBatches: task.totalBatches,
      successfulBatches: successful.length,
      failedBatches: failed.length,
      totalDuration,
      averageBatchDuration: successful.length > 0 ? 
        successful.reduce((sum, r) => sum + r.duration, 0) / successful.length : 0,
      results: task.results,
      generatedFiles: successful.map(r => r.result?.filePath).filter(Boolean),
      errors: failed.map(r => r.error)
    };
  }

  /**
   * 验证批量导出配置
   * @param config 批量导出配置
   */
  private validateBatchConfig(config: BatchExportConfig): void {
    if (!config.outputDirectory) {
      throw new ExportError('
- **文件**: extension/export/BatchExportManager.ts
- **行号**: 675
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/DataFilter.ts 第 6 行发现可疑模式: ';

/**
 * 数据过滤器类
 * 提供灵活的数据过滤功能
 */
export class DataFilter {
  private conditions: FilterCondition[];
  
  /**
   * 构造函数
   * @param conditions 过滤条件数组
   */
  constructor(conditions: FilterCondition[] = []) {
    this.conditions = conditions;
  }

  /**
   * 过滤数据记录
   * @param records 数据记录数组
   * @returns 过滤后的数据记录
   */
  filter(records: any[][]): any[][] {
    if (this.conditions.length === 0) {
      return records;
    }
    
    return records.filter(record => this.evaluateRecord(record));
  }

  /**
   * 异步过滤数据记录
   * @param records 异步数据记录迭代器
   * @returns 过滤后的数据记录异步迭代器
   */
  async *filterAsync(records: AsyncIterable<any[]>): AsyncIterable<any[]> {
    if (this.conditions.length === 0) {
      for await (const record of records) {
        yield record;
      }
      return;
    }
    
    for await (const record of records) {
      if (this.evaluateRecord(record)) {
        yield record;
      }
    }
  }

  /**
   * 评估单条记录是否符合过滤条件
   * @param record 数据记录
   * @returns 是否符合条件
   */
  private evaluateRecord(record: any[]): boolean {
    if (this.conditions.length === 0) {
      return true;
    }

    // 处理逻辑运算符
    let result = this.evaluateCondition(record, this.conditions[0]);
    
    for (let i = 1; i < this.conditions.length; i++) {
      const condition = this.conditions[i];
      const conditionResult = this.evaluateCondition(record, condition);
      
      if (condition.logicalOperator === '
- **文件**: extension/export/DataFilter.ts
- **行号**: 6
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/DataTransformer.ts 第 76 行发现可疑模式: ${transformation.type}
- **文件**: extension/export/DataTransformer.ts
- **行号**: 76
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/DataTransformer.ts 第 336 行发现可疑模式: ': (date.getMonth() + 1).toString().padStart(2, '
- **文件**: extension/export/DataTransformer.ts
- **行号**: 336
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/DataTransformer.ts 第 337 行发现可疑模式: ': (date.getMonth() + 1).toString(),
      '
- **文件**: extension/export/DataTransformer.ts
- **行号**: 337
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的Command Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/DataTransformer.ts 第 73 行发现可疑模式: Function(
- **文件**: extension/export/DataTransformer.ts
- **行号**: 73
- **CWE ID**: CWE-78
- **建议**: 避免执行外部命令，使用安全的API替代

### 🔴 潜在的Command Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/DataTransformer.ts 第 237 行发现可疑模式: Function(
- **文件**: extension/export/DataTransformer.ts
- **行号**: 237
- **CWE ID**: CWE-78
- **建议**: 避免执行外部命令，使用安全的API替代

### 🔴 潜在的Command Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/DataTransformer.ts 第 249 行发现可疑模式: Function(
- **文件**: extension/export/DataTransformer.ts
- **行号**: 249
- **CWE ID**: CWE-78
- **建议**: 避免执行外部命令，使用安全的API替代

### 🔴 潜在的Command Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/DataTransformer.ts 第 272 行发现可疑模式: Function(
- **文件**: extension/export/DataTransformer.ts
- **行号**: 272
- **CWE ID**: CWE-78
- **建议**: 避免执行外部命令，使用安全的API替代

### 🔴 潜在的Command Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/DataTransformer.ts 第 465 行发现可疑模式: Function(
- **文件**: extension/export/DataTransformer.ts
- **行号**: 465
- **CWE ID**: CWE-78
- **建议**: 避免执行外部命令，使用安全的API替代

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/ExportManager.ts 第 80 行发现可疑模式: ${config.format.type}
- **文件**: extension/export/ExportManager.ts
- **行号**: 80
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/ExportManager.ts 第 136 行发现可疑模式: ${error.message}
- **文件**: extension/export/ExportManager.ts
- **行号**: 136
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/ExportManager.ts 第 427 行发现可疑模式: ${Date.now()}
- **文件**: extension/export/ExportManager.ts
- **行号**: 427
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/ExportManager.ts 第 427 行发现可疑模式: ${Math.random().toString(36).substr(2, 9)}
- **文件**: extension/export/ExportManager.ts
- **行号**: 427
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/ExportManager.ts 第 444 行发现可疑模式: ${config.format.type}
- **文件**: extension/export/ExportManager.ts
- **行号**: 444
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/ExportManager.ts 第 450 行发现可疑模式: ${directory}
- **文件**: extension/export/ExportManager.ts
- **行号**: 450
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/ExportManager.ts 第 455 行发现可疑模式: ${config.file.path}
- **文件**: extension/export/ExportManager.ts
- **行号**: 455
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/ExportManager.ts 第 111 行发现可疑模式: ', 30 + percentage * 0.6, processed, processedData.totalRecords);
        });
      }
      
      const result = await exporter.exportData(processedData, config.file.path);
      
      // 完成处理
      this.reportProgress(taskId, '
- **文件**: extension/export/ExportManager.ts
- **行号**: 111
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/ExportManager.ts 第 218 行发现可疑模式: '
          }
        };
      },
      
      generateMockData: function*(count: number): Generator<any[], void, unknown> {
        for (let i = 0; i < count; i++) {
          yield [
            new Date(Date.now() - (count - i) * 1000).toISOString(),
            (20 + Math.random() * 10).toFixed(2),
            (40 + Math.random() * 20).toFixed(2),
            (1000 + Math.random() * 50).toFixed(2)
          ];
        }
      }
    };
  }

  /**
   * 处理数据（过滤和转换）
   * @param data 原始数据
   * @param config 导出配置
   * @param taskId 任务ID
   * @returns 处理后的数据
   */
  private async processData(data: ExportData, config: ExportConfig, taskId: string): Promise<ExportData> {
    let processedData = data;
    
    // 应用过滤器
    if (config.filters && Object.keys(config.filters).length > 0) {
      const filterConditions = this.buildFilterConditions(config.filters);
      if (filterConditions.length > 0) {
        const filter = new DataFilter(filterConditions);
        
        // 将异步迭代器转换为数组进行过滤
        const recordsArray = Array.isArray(processedData.records) 
          ? processedData.records 
          : await this.collectAsyncRecords(processedData.records);
        
        const filteredRecords = filter.filter(recordsArray);
        
        processedData = {
          ...processedData,
          records: filteredRecords,
          totalRecords: filteredRecords.length
        };
      }
    }
    
    // 应用数据转换
    if (config.processing) {
      const transformations = this.buildTransformations(config.processing);
      if (transformations.length > 0) {
        const transformer = new DataTransformer(transformations);
        
        // 确保我们有数组格式的记录
        const recordsArray = Array.isArray(processedData.records) 
          ? processedData.records 
          : await this.collectAsyncRecords(processedData.records);
        
        const transformedRecords = transformer.transform(recordsArray);
        
        processedData = {
          ...processedData,
          records: transformedRecords
        };
      }
    }
    
    return processedData;
  }

  /**
   * 收集异步记录为数组
   * @param asyncRecords 异步记录迭代器
   * @returns 记录数组
   */
  private async collectAsyncRecords(asyncRecords: AsyncIterable<any[]>): Promise<any[][]> {
    const records: any[][] = [];
    for await (const record of asyncRecords) {
      records.push(record);
    }
    return records;
  }

  /**
   * 构建过滤条件
   * @param filters 过滤配置
   * @returns 过滤条件数组
   */
  private buildFilterConditions(filters: any): FilterCondition[] {
    const conditions: FilterCondition[] = [];
    
    // 时间范围过滤
    if (filters.timeRange) {
      conditions.push({
        columnIndex: 0, // 假设第一列是时间戳
        operator: '
- **文件**: extension/export/ExportManager.ts
- **行号**: 218
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/ExportManager.ts 第 324 行发现可疑模式: ',
        value: filters.valueRange
      });
    }
    
    // 自定义条件
    if (filters.conditions) {
      conditions.push(...filters.conditions);
    }
    
    return conditions;
  }

  /**
   * 构建数据转换配置
   * @param processing 处理配置
   * @returns 转换配置数组
   */
  private buildTransformations(processing: any): DataTransformation[] {
    const transformations: DataTransformation[] = [];
    
    // 精度转换
    if (processing.precision !== undefined) {
      for (let i = 1; i < 4; i++) { // 假设列1-3是数值列
        transformations.push({
          type: '
- **文件**: extension/export/ExportManager.ts
- **行号**: 324
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/CSVExporter.ts 第 112 行发现可疑模式: ${error.message}
- **文件**: extension/export/exporters/CSVExporter.ts
- **行号**: 112
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/CSVExporter.ts 第 31 行发现可疑模式: ',
      ...options
    } as Required<CSVOptions>;
  }

  /**
   * 设置进度回调
   * @param callback 进度回调函数
   */
  setProgressCallback(callback: (percentage: number, processed: number) => void): void {
    this.progressCallback = callback;
  }

  /**
   * 导出数据到CSV文件
   * @param data 导出数据
   * @param filePath 文件路径
   * @returns 导出结果
   */
  async exportData(data: ExportData, filePath: string): Promise<ExportResult> {
    const startTime = performance.now();
    let recordCount = 0;
    let fileSize = 0;
    
    try {
      // 创建写入流
      const writeStream = fs.createWriteStream(filePath, {
        encoding: this.options.encoding as BufferEncoding
      });
      
      // 写入表头
      if (this.options.includeHeader && data.headers && data.headers.length > 0) {
        const headerLine = this.formatCSVLine(data.headers);
        writeStream.write(headerLine + this.options.lineEnding);
        fileSize += Buffer.byteLength(headerLine + this.options.lineEnding, this.options.encoding as BufferEncoding);
      }
      
      // 流式写入数据
      if (Array.isArray(data.records)) {
        // 处理数组数据
        for (const record of data.records) {
          const csvLine = this.formatCSVLine(record);
          writeStream.write(csvLine + this.options.lineEnding);
          fileSize += Buffer.byteLength(csvLine + this.options.lineEnding, this.options.encoding as BufferEncoding);
          recordCount++;
          
          // 报告进度
          if (recordCount % 1000 === 0) {
            this.reportProgress(recordCount, data.totalRecords);
          }
        }
      } else {
        // 处理异步迭代器数据
        for await (const record of data.records) {
          const csvLine = this.formatCSVLine(record);
          writeStream.write(csvLine + this.options.lineEnding);
          fileSize += Buffer.byteLength(csvLine + this.options.lineEnding, this.options.encoding as BufferEncoding);
          recordCount++;
          
          // 报告进度
          if (recordCount % 1000 === 0) {
            this.reportProgress(recordCount, data.totalRecords);
          }
        }
      }
      
      // 关闭流
      await this.closeStream(writeStream);
      
      // 最终进度报告
      this.reportProgress(recordCount, recordCount);
      
      return {
        success: true,
        filePath,
        fileSize,
        recordCount,
        duration: performance.now() - startTime
      };
      
    } catch (error) {
      throw new ExportError(`CSV export failed: ${error.message}`);
    }
  }

  /**
   * 格式化CSV行
   * @param values 值数组
   * @returns 格式化的CSV行
   */
  private formatCSVLine(values: any[]): string {
    return values.map(value => this.formatCSVValue(value)).join(this.options.delimiter);
  }

  /**
   * 格式化CSV值
   * @param value 值
   * @returns 格式化的值
   */
  private formatCSVValue(value: any): string {
    if (value === null || value === undefined) {
      return '
- **文件**: extension/export/exporters/CSVExporter.ts
- **行号**: 31
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/CSVExporter.ts 第 188 行发现可疑模式: '),
      this.options.escape + this.options.quote
    );
    return this.options.quote + escapedValue + this.options.quote;
  }

  /**
   * 格式化日期
   * @param date 日期对象
   * @returns 格式化的日期字符串
   */
  private formatDate(date: Date): string {
    if (!this.options.dateFormat) {
      return date.toISOString();
    }
    
    const formatMap: { [key: string]: string } = {
      '
- **文件**: extension/export/exporters/CSVExporter.ts
- **行号**: 188
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/CSVExporter.ts 第 207 行发现可疑模式: ': (date.getMonth() + 1).toString().padStart(2, '
- **文件**: extension/export/exporters/CSVExporter.ts
- **行号**: 207
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/CSVExporter.ts 第 208 行发现可疑模式: ': (date.getMonth() + 1).toString(),
      '
- **文件**: extension/export/exporters/CSVExporter.ts
- **行号**: 208
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/CSVExporter.ts 第 366 行发现可疑模式: '), escape + quote);
      return quote + escapedText + quote;
    }
    
    return text;
  }

  /**
   * 解析CSV行
   * @param line CSV行
   * @param delimiter 分隔符
   * @param quote 引号字符
   * @returns 解析后的值数组
   */
  static parseCSVLine(line: string, delimiter = '
- **文件**: extension/export/exporters/CSVExporter.ts
- **行号**: 366
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/CSVExporter.ts 第 382 行发现可疑模式: ';
    let inQuotes = false;
    let i = 0;
    
    while (i < line.length) {
      const char = line[i];
      
      if (char === quote) {
        if (inQuotes && line[i + 1] === quote) {
          // 转义的引号
          current += quote;
          i += 2;
        } else {
          // 引号开始或结束
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === delimiter && !inQuotes) {
        // 字段分隔符
        values.push(current);
        current = '
- **文件**: extension/export/exporters/CSVExporter.ts
- **行号**: 382
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/ExcelExporter.ts 第 120 行发现可疑模式: ${error.message}
- **文件**: extension/export/exporters/ExcelExporter.ts
- **行号**: 120
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/ExcelExporter.ts 第 30 行发现可疑模式: ',
      chartConfig: undefined,
      ...options
    } as Required<ExcelOptions>;
  }

  /**
   * 设置进度回调
   * @param callback 进度回调函数
   */
  setProgressCallback(callback: (percentage: number, processed: number) => void): void {
    this.progressCallback = callback;
  }

  /**
   * 导出数据到Excel文件
   * @param data 导出数据
   * @param filePath 文件路径
   * @returns 导出结果
   */
  async exportData(data: ExportData, filePath: string): Promise<ExportResult> {
    const startTime = performance.now();
    
    try {
      // 报告开始进度
      this.reportProgress(5, 0);
      
      // 创建工作簿
      const workbook = new ExcelJS.Workbook();
      this.setupWorkbookProperties(workbook);
      
      // 创建数据工作表
      const worksheet = workbook.addWorksheet(this.options.sheetName);
      this.reportProgress(10, 0);
      
      // 添加标题行
      let currentRow = 1;
      if (data.headers && data.headers.length > 0) {
        const headerRow = worksheet.addRow(data.headers);
        this.styleHeaderRow(headerRow);
        currentRow++;
      }
      
      this.reportProgress(15, 0);
      
      // 添加数据行
      const recordCount = await this.addDataRows(worksheet, data, currentRow);
      
      this.reportProgress(70, recordCount);
      
      // 自动调整列宽
      if (this.options.autoFitColumns) {
        this.autoFitColumns(worksheet);
      }
      
      this.reportProgress(80, recordCount);
      
      // 添加图表
      if (this.options.includeChart && this.options.chartConfig) {
        await this.addChart(worksheet, this.options.chartConfig, recordCount);
      }
      
      this.reportProgress(85, recordCount);
      
      // 添加元数据工作表
      if (this.options.includeMetadata) {
        this.addMetadataSheet(workbook, data);
      }
      
      this.reportProgress(90, recordCount);
      
      // 保存文件
      await workbook.xlsx.writeFile(filePath);
      
      this.reportProgress(95, recordCount);
      
      // 获取文件统计信息
      const fileStats = await fs.promises.stat(filePath);
      
      this.reportProgress(100, recordCount);
      
      return {
        success: true,
        filePath,
        fileSize: fileStats.size,
        recordCount,
        duration: performance.now() - startTime
      };
      
    } catch (error) {
      throw new ExportError(`Excel export failed: ${error.message}`);
    }
  }

  /**
   * 设置工作簿属性
   * @param workbook 工作簿
   */
  private setupWorkbookProperties(workbook: ExcelJS.Workbook): void {
    workbook.creator = '
- **文件**: extension/export/exporters/ExcelExporter.ts
- **行号**: 30
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/ExcelExporter.ts 第 168 行发现可疑模式: '
      };
    });
    
    // 设置行高
    row.height = 25;
  }

  /**
   * 添加数据行
   * @param worksheet 工作表
   * @param data 导出数据
   * @param startRow 起始行号
   * @returns 添加的记录数
   */
  private async addDataRows(worksheet: ExcelJS.Worksheet, data: ExportData, startRow: number): Promise<number> {
    let recordCount = 0;
    let currentRow = startRow;
    
    if (Array.isArray(data.records)) {
      // 处理数组数据
      for (const record of data.records) {
        const formattedRecord = this.formatExcelRecord(record);
        const row = worksheet.addRow(formattedRecord);
        this.styleDataRow(row, recordCount);
        recordCount++;
        currentRow++;
        
        // 定期报告进度
        if (recordCount % 1000 === 0) {
          this.reportProgress(15 + (recordCount / data.totalRecords) * 55, recordCount);
        }
      }
    } else {
      // 处理异步迭代器数据
      for await (const record of data.records) {
        const formattedRecord = this.formatExcelRecord(record);
        const row = worksheet.addRow(formattedRecord);
        this.styleDataRow(row, recordCount);
        recordCount++;
        currentRow++;
        
        // 定期报告进度
        if (recordCount % 1000 === 0) {
          this.reportProgress(15 + (recordCount / data.totalRecords) * 55, recordCount);
        }
      }
    }
    
    return recordCount;
  }

  /**
   * 格式化Excel记录
   * @param record 原始记录
   * @returns 格式化的记录
   */
  private formatExcelRecord(record: any[]): any[] {
    return record.map((value, index) => {
      // 处理日期
      if (value instanceof Date) {
        return value;
      }
      
      // 处理字符串形式的日期
      if (typeof value === '
- **文件**: extension/export/exporters/ExcelExporter.ts
- **行号**: 168
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/ExcelExporter.ts 第 294 行发现可疑模式: '
      };
    });
  }

  /**
   * 自动调整列宽
   * @param worksheet 工作表
   */
  private autoFitColumns(worksheet: ExcelJS.Worksheet): void {
    worksheet.columns.forEach(column => {
      if (!column.eachCell) return;
      
      let maxLength = 0;
      
      column.eachCell({ includeEmpty: false }, cell => {
        const cellLength = this.getCellDisplayLength(cell.value);
        maxLength = Math.max(maxLength, cellLength);
      });
      
      // 设置列宽，限制在合理范围内
      column.width = Math.min(Math.max(maxLength + 2, 10), 50);
    });
  }

  /**
   * 获取单元格显示长度
   * @param value 单元格值
   * @returns 显示长度
   */
  private getCellDisplayLength(value: any): number {
    if (value == null) return 0;
    
    if (value instanceof Date) {
      return this.options.dateFormat?.length || 20;
    }
    
    if (typeof value === '
- **文件**: extension/export/exporters/ExcelExporter.ts
- **行号**: 294
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/ExcelExporter.ts 第 331 行发现可疑模式: ') {
      return value.toString().length + 2; // 额外空间用于格式化
    }
    
    return value.toString().length;
  }

  /**
   * 添加图表
   * @param worksheet 工作表
   * @param chartConfig 图表配置
   * @param recordCount 记录数
   */
  private async addChart(worksheet: ExcelJS.Worksheet, chartConfig: ChartConfig, recordCount: number): Promise<void> {
    // ExcelJS图表功能相对有限，这里提供基本实现
    // 实际项目中可能需要更复杂的图表库
    
    try {
      // 创建图表（ExcelJS的图表API可能因版本而异）
      const chart = worksheet.addChart({
        type: chartConfig.type as any,
        position: {
          x: chartConfig.position.x,
          y: chartConfig.position.y
        },
        size: {
          width: chartConfig.size.width,
          height: chartConfig.size.height
        }
      } as any);
      
      // 配置数据系列
      (chart as any).addSeries({
        name: chartConfig.series.name,
        categories: chartConfig.series.categories,
        values: chartConfig.series.values
      });
      
    } catch (error) {
      console.warn('
- **文件**: extension/export/exporters/ExcelExporter.ts
- **行号**: 331
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/ExcelExporter.ts 第 459 行发现可疑模式: ' && value !== null) {
          sheet.addRow([indent + key, '
- **文件**: extension/export/exporters/ExcelExporter.ts
- **行号**: 459
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/ExcelExporter.ts 第 460 行发现可疑模式: ']);
          this.addObjectToSheet(sheet, value, depth + 1);
        } else {
          sheet.addRow([indent + key, String(value)]);
        }
      }
    }
  }

  /**
   * 样式化元数据工作表
   * @param sheet 元数据工作表
   */
  private styleMetadataSheet(sheet: ExcelJS.Worksheet): void {
    sheet.eachRow(row => {
      row.eachCell(cell => {
        cell.border = {
          top: { style: '
- **文件**: extension/export/exporters/ExcelExporter.ts
- **行号**: 460
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/JSONExporter.ts 第 89 行发现可疑模式: ${error.message}
- **文件**: extension/export/exporters/JSONExporter.ts
- **行号**: 89
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/JSONExporter.ts 第 125 行发现可疑模式: ',
      recordCount: data.totalRecords,
      options: {
        pretty: this.options.pretty,
        arrayFormat: this.options.arrayFormat
      }
    };
    
    // 添加原始元数据
    if (data.metadata) {
      metadata.original = data.metadata;
    }
    
    // 添加数据集信息
    if (data.datasets && data.datasets.length > 0) {
      metadata.datasets = data.datasets.map(ds => ({
        id: ds.id,
        title: ds.title,
        units: ds.units,
        type: ds.dataType,
        widget: ds.widget,
        group: ds.group
      }));
    }
    
    // 添加列信息
    if (data.headers && data.headers.length > 0) {
      metadata.columns = data.headers.map((header, index) => ({
        index,
        name: header,
        type: this.inferColumnType(data, index)
      }));
    }
    
    return metadata;
  }

  /**
   * 构建数组格式数据
   * @param data 导出数据
   * @returns 数组格式数据
   */
  private async buildArrayFormat(data: ExportData): Promise<any[]> {
    const records: any[] = [];
    let processedCount = 0;
    
    if (Array.isArray(data.records)) {
      // 处理数组数据
      for (const record of data.records) {
        const recordObject = this.formatRecord(record, data.headers);
        records.push(recordObject);
        processedCount++;
        
        // 定期报告进度
        if (processedCount % 1000 === 0) {
          this.reportProgress(25 + (processedCount / data.totalRecords) * 25, processedCount);
        }
      }
    } else {
      // 处理异步迭代器数据
      for await (const record of data.records) {
        const recordObject = this.formatRecord(record, data.headers);
        records.push(recordObject);
        processedCount++;
        
        // 定期报告进度
        if (processedCount % 1000 === 0) {
          this.reportProgress(25 + (processedCount / data.totalRecords) * 25, processedCount);
        }
      }
    }
    
    return records;
  }

  /**
   * 构建数据集格式数据
   * @param data 导出数据
   * @returns 数据集格式数据
   */
  private async buildDatasetFormat(data: ExportData): Promise<any> {
    const datasets: any = {};
    
    // 初始化数据集结构
    for (const dataset of data.datasets || []) {
      datasets[dataset.id] = {
        info: {
          title: dataset.title,
          units: dataset.units,
          type: dataset.dataType,
          widget: dataset.widget,
          group: dataset.group
        },
        values: []
      };
    }
    
    let processedCount = 0;
    
    if (Array.isArray(data.records)) {
      // 处理数组数据
      for (const record of data.records) {
        this.addRecordToDatasets(record, data.headers, datasets);
        processedCount++;
        
        // 定期报告进度
        if (processedCount % 1000 === 0) {
          this.reportProgress(25 + (processedCount / data.totalRecords) * 25, processedCount);
        }
      }
    } else {
      // 处理异步迭代器数据
      for await (const record of data.records) {
        this.addRecordToDatasets(record, data.headers, datasets);
        processedCount++;
        
        // 定期报告进度
        if (processedCount % 1000 === 0) {
          this.reportProgress(25 + (processedCount / data.totalRecords) * 25, processedCount);
        }
      }
    }
    
    return datasets;
  }

  /**
   * 格式化记录为对象
   * @param record 记录数组
   * @param headers 标题数组
   * @returns 记录对象
   */
  private formatRecord(record: any[], headers: string[] | undefined): any {
    if (!headers || headers.length === 0) {
      return record;
    }
    
    const recordObject: any = {};
    
    for (let i = 0; i < Math.min(record.length, headers.length); i++) {
      const key = headers[i];
      let value = record[i];
      
      // 处理特殊值
      value = this.processValue(value);
      
      recordObject[key] = value;
    }
    
    return recordObject;
  }

  /**
   * 将记录添加到数据集中
   * @param record 记录数组
   * @param headers 标题数组
   * @param datasets 数据集对象
   */
  private addRecordToDatasets(record: any[], headers: string[] | undefined, datasets: any): void {
    if (!headers || headers.length === 0) {
      return;
    }
    
    // 假设第一列是时间戳
    const timestamp = record[0];
    
    for (let i = 1; i < Math.min(record.length, headers.length); i++) {
      const header = headers[i];
      const value = this.processValue(record[i]);
      
      // 查找对应的数据集
      const datasetKey = Object.keys(datasets).find(key => 
        datasets[key].info.title === header || key === header
      );
      
      if (datasetKey && datasets[datasetKey]) {
        datasets[datasetKey].values.push({
          timestamp,
          value
        });
      }
    }
  }

  /**
   * 处理值，确保JSON兼容性
   * @param value 原始值
   * @returns 处理后的值
   */
  private processValue(value: any): any {
    // 处理 null 和 undefined
    if (value == null) {
      return null;
    }
    
    // 处理 NaN 和 Infinity
    if (typeof value === '
- **文件**: extension/export/exporters/JSONExporter.ts
- **行号**: 125
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 82 行发现可疑模式: ${error.message}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 82
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 95 行发现可疑模式: ${this.options.encoding}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 95
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 95 行发现可疑模式: ${newline}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 95
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 98 行发现可疑模式: ${this.options.rootElement}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 98
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 102 行发现可疑模式: ${data.totalRecords}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 102
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 103 行发现可疑模式: ${new Date().toISOString()}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 103
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 107 行发现可疑模式: ${newline}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 107
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 123 行发现可疑模式: ${this.options.rootElement}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 123
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 123 行发现可疑模式: ${newline}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 123
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 136 行发现可疑模式: ${indent}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 136
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 136 行发现可疑模式: ${newline}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 136
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 140 行发现可疑模式: ${indent}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 140
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 140 行发现可疑模式: ${newline}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 140
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 153 行发现可疑模式: ${indent}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 153
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 153 行发现可疑模式: ${newline}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 153
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 156 行发现可疑模式: ${indent}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 156
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 156 行发现可疑模式: ${indent}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 156
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 157 行发现可疑模式: ${this.escapeXML(dataset.id)}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 157
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 158 行发现可疑模式: ${this.escapeXML(dataset.title)}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 158
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 159 行发现可疑模式: ${this.escapeXML(dataset.units)}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 159
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 160 行发现可疑模式: ${this.escapeXML(dataset.dataType)}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 160
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 161 行发现可疑模式: ${this.escapeXML(dataset.widget)}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 161
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 162 行发现可疑模式: ${this.escapeXML(dataset.group)}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 162
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 163 行发现可疑模式: ${newline}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 163
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 166 行发现可疑模式: ${indent}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 166
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 166 行发现可疑模式: ${newline}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 166
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 179 行发现可疑模式: ${indent}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 179
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 179 行发现可疑模式: ${newline}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 179
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 206 行发现可疑模式: ${indent}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 206
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 206 行发现可疑模式: ${newline}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 206
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 220 行发现可疑模式: ${indent}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 220
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 220 行发现可疑模式: ${this.options.recordElement}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 220
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 227 行发现可疑模式: ${header}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 227
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 227 行发现可疑模式: ${value}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 227
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 229 行发现可疑模式: ${newline}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 229
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 232 行发现可疑模式: ${newline}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 232
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 238 行发现可疑模式: ${indent}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 238
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 238 行发现可疑模式: ${header}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 238
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 238 行发现可疑模式: ${value}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 238
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 238 行发现可疑模式: ${header}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 238
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 238 行发现可疑模式: ${newline}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 238
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 244 行发现可疑模式: ${indent}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 244
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 244 行发现可疑模式: ${i}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 244
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 244 行发现可疑模式: ${value}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 244
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 244 行发现可疑模式: ${i}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 244
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 244 行发现可疑模式: ${newline}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 244
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 248 行发现可疑模式: ${indent}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 248
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 248 行发现可疑模式: ${this.options.recordElement}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 248
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 248 行发现可疑模式: ${newline}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 248
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 270 行发现可疑模式: ${indent}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 270
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 270 行发现可疑模式: ${i}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 270
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 270 行发现可疑模式: ${newline}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 270
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 272 行发现可疑模式: ${indent}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 272
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 272 行发现可疑模式: ${newline}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 272
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 279 行发现可疑模式: ${indent}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 279
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 279 行发现可疑模式: ${elementName}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 279
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 279 行发现可疑模式: ${newline}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 279
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 281 行发现可疑模式: ${indent}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 281
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 281 行发现可疑模式: ${elementName}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 281
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 281 行发现可疑模式: ${newline}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 281
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 284 行发现可疑模式: ${indent}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 284
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 284 行发现可疑模式: ${elementName}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 284
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 284 行发现可疑模式: ${escapedValue}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 284
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 284 行发现可疑模式: ${elementName}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 284
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 284 行发现可疑模式: ${newline}
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 284
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 95 行发现可疑模式: "?>${newline}`;
    
    // 根元素开始标签
    xml += `<${this.options.rootElement}`;
    
    // 添加根元素属性
    if (this.options.includeAttributes) {
      xml += ` recordCount="
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 95
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 102 行发现可疑模式: "`;
      xml += ` exportTime="
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 102
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 103 行发现可疑模式: "`;
      xml += ` source="
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 103
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 104 行发现可疑模式: "`;
    }
    
    xml += `>${newline}`;
    
    // 添加元数据
    if (this.options.includeAttributes && data.metadata) {
      xml += this.buildMetadataSection(data.metadata, indent, newline);
    }
    
    // 添加数据集信息
    if (this.options.includeAttributes && data.datasets && data.datasets.length > 0) {
      xml += this.buildDatasetsSection(data.datasets, indent, newline);
    }
    
    // 添加数据记录
    xml += await this.buildRecordsSection(data, indent, newline);
    
    // 根元素结束标签
    xml += `</${this.options.rootElement}>${newline}`;
    
    return xml;
  }

  /**
   * 构建元数据部分
   * @param metadata 元数据
   * @param indent 缩进
   * @param newline 换行符
   * @returns 元数据XML
   */
  private buildMetadataSection(metadata: any, indent: string, newline: string): string {
    let xml = `${indent}<metadata>${newline}`;
    
    xml += this.objectToXML(metadata, indent + indent, newline);
    
    xml += `${indent}</metadata>${newline}`;
    
    return xml;
  }

  /**
   * 构建数据集部分
   * @param datasets 数据集数组
   * @param indent 缩进
   * @param newline 换行符
   * @returns 数据集XML
   */
  private buildDatasetsSection(datasets: any[], indent: string, newline: string): string {
    let xml = `${indent}<datasets>${newline}`;
    
    for (const dataset of datasets) {
      xml += `${indent}${indent}<dataset`;
      xml += ` id="
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 104
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 157 行发现可疑模式: "`;
      xml += ` title="
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 157
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 158 行发现可疑模式: "`;
      xml += ` units="
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 158
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 159 行发现可疑模式: "`;
      xml += ` type="
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 159
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 160 行发现可疑模式: "`;
      xml += ` widget="
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 160
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 161 行发现可疑模式: "`;
      xml += ` group="
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 161
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 162 行发现可疑模式: "`;
      xml += `/>${newline}`;
    }
    
    xml += `${indent}</datasets>${newline}`;
    
    return xml;
  }

  /**
   * 构建记录部分
   * @param data 导出数据
   * @param indent 缩进
   * @param newline 换行符
   * @returns 记录XML
   */
  private async buildRecordsSection(data: ExportData, indent: string, newline: string): Promise<string> {
    let xml = `${indent}<records>${newline}`;
    let processedCount = 0;
    
    if (Array.isArray(data.records)) {
      // 处理数组数据
      for (const record of data.records) {
        xml += this.buildRecordXML(record, data.headers, indent + indent, newline);
        processedCount++;
        
        // 定期报告进度
        if (processedCount % 1000 === 0) {
          this.reportProgress(10 + (processedCount / data.totalRecords) * 70, processedCount);
        }
      }
    } else {
      // 处理异步迭代器数据
      for await (const record of data.records) {
        xml += this.buildRecordXML(record, data.headers, indent + indent, newline);
        processedCount++;
        
        // 定期报告进度
        if (processedCount % 1000 === 0) {
          this.reportProgress(10 + (processedCount / data.totalRecords) * 70, processedCount);
        }
      }
    }
    
    xml += `${indent}</records>${newline}`;
    
    return xml;
  }

  /**
   * 构建单条记录XML
   * @param record 记录数组
   * @param headers 标题数组
   * @param indent 缩进
   * @param newline 换行符
   * @returns 记录XML
   */
  private buildRecordXML(record: any[], headers: string[] | undefined, indent: string, newline: string): string {
    let xml = `${indent}<${this.options.recordElement}`;
    
    // 添加记录属性（如果启用）
    if (this.options.includeAttributes && headers && headers.length > 0) {
      for (let i = 0; i < Math.min(record.length, headers.length); i++) {
        const header = this.sanitizeElementName(headers[i]);
        const value = this.escapeXML(String(record[i] ?? '
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 162
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 226 行发现可疑模式: '));
        xml += ` ${header}="
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 226
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 227 行发现可疑模式: "`;
      }
      xml += `/>${newline}`;
    } else {
      // 使用子元素格式
      xml += `>${newline}`;
      
      if (headers && headers.length > 0) {
        for (let i = 0; i < Math.min(record.length, headers.length); i++) {
          const header = this.sanitizeElementName(headers[i]);
          const value = this.escapeXML(String(record[i] ?? '
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 227
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 237 行发现可疑模式: '));
          xml += `${indent}  <${header}>${value}</${header}>${newline}`;
        }
      } else {
        // 没有标题时使用通用字段名
        for (let i = 0; i < record.length; i++) {
          const value = this.escapeXML(String(record[i] ?? '
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 237
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 243 行发现可疑模式: '));
          xml += `${indent}  <field${i}>${value}</field${i}>${newline}`;
        }
      }
      
      xml += `${indent}</${this.options.recordElement}>${newline}`;
    }
    
    return xml;
  }

  /**
   * 将对象转换为XML
   * @param obj 对象
   * @param indent 缩进
   * @param newline 换行符
   * @returns XML字符串
   */
  private objectToXML(obj: any, indent: string, newline: string): string {
    let xml = '
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 243
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 264 行发现可疑模式: ' || obj === null) {
      return this.escapeXML(String(obj));
    }
    
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        xml += `${indent}<item index="
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 264
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 270 行发现可疑模式: ">${newline}`;
        xml += this.objectToXML(obj[i], indent + '
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 270
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 271 行发现可疑模式: ', newline);
        xml += `${indent}</item>${newline}`;
      }
    } else {
      for (const [key, value] of Object.entries(obj)) {
        const elementName = this.sanitizeElementName(key);
        
        if (typeof value === '
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 271
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 278 行发现可疑模式: ' && value !== null) {
          xml += `${indent}<${elementName}>${newline}`;
          xml += this.objectToXML(value, indent + '
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 278
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 280 行发现可疑模式: ', newline);
          xml += `${indent}</${elementName}>${newline}`;
        } else {
          const escapedValue = this.escapeXML(String(value ?? '
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 280
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 283 行发现可疑模式: '));
          xml += `${indent}<${elementName}>${escapedValue}</${elementName}>${newline}`;
        }
      }
    }
    
    return xml;
  }

  /**
   * 转义XML特殊字符
   * @param text 文本
   * @returns 转义后的文本
   */
  private escapeXML(text: string): string {
    if (!text) return '
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 283
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 331 行发现可疑模式: ' + sanitized;
    }
    
    return sanitized;
  }

  /**
   * 报告导出进度
   * @param percentage 进度百分比
   * @param processed 已处理记录数
   */
  private reportProgress(percentage: number, processed: number): void {
    if (this.progressCallback) {
      this.progressCallback(Math.min(100, Math.max(0, percentage)), processed);
    }
  }

  /**
   * 验证XML选项
   * @param options XML选项
   * @returns 是否有效
   */
  static validateOptions(options: XMLOptions): boolean {
    // 检查根元素名称
    if (!XMLExporter.isValidElementName(options.rootElement)) {
      return false;
    }
    
    // 检查记录元素名称
    if (!XMLExporter.isValidElementName(options.recordElement)) {
      return false;
    }
    
    // 检查编码
    const supportedEncodings = ['
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 331
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 462 行发现可疑模式: ';
    let indentLevel = 0;
    const lines = xmlString.split(/>\s*</);
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      
      if (i > 0) line = '
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 462
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 469 行发现可疑模式: ' + line;
      if (i < lines.length - 1) line = line + '
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 469
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 470 行发现可疑模式: ';
      
      // 处理自闭合标签
      if (line.match(/\/>/)) {
        formatted += indent.repeat(indentLevel) + line + '
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 470
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 474 行发现可疑模式: ';
      }
      // 处理结束标签
      else if (line.match(/<\//)) {
        indentLevel--;
        formatted += indent.repeat(indentLevel) + line + '
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 474
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 479 行发现可疑模式: ';
      }
      // 处理开始标签
      else if (line.match(/</)) {
        formatted += indent.repeat(indentLevel) + line + '
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 479
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 483 行发现可疑模式: ';
        indentLevel++;
      }
      // 处理文本内容
      else {
        formatted += indent.repeat(indentLevel) + line + '
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 483
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/utils.ts 第 65 行发现可疑模式: ${prefix}
- **文件**: extension/export/utils.ts
- **行号**: 65
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/utils.ts 第 65 行发现可疑模式: ${timestamp}
- **文件**: extension/export/utils.ts
- **行号**: 65
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/utils.ts 第 65 行发现可疑模式: ${time}
- **文件**: extension/export/utils.ts
- **行号**: 65
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/utils.ts 第 65 行发现可疑模式: ${extensions[formatType]}
- **文件**: extension/export/utils.ts
- **行号**: 65
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/utils.ts 第 169 行发现可疑模式: ${directory}
- **文件**: extension/export/utils.ts
- **行号**: 169
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/utils.ts 第 172 行发现可疑模式: ${directory}
- **文件**: extension/export/utils.ts
- **行号**: 172
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/utils.ts 第 214 行发现可疑模式: ${size.toFixed(2)}
- **文件**: extension/export/utils.ts
- **行号**: 214
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/utils.ts 第 214 行发现可疑模式: ${units[unitIndex]}
- **文件**: extension/export/utils.ts
- **行号**: 214
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/utils.ts 第 224 行发现可疑模式: ${Math.round(milliseconds)}
- **文件**: extension/export/utils.ts
- **行号**: 224
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/utils.ts 第 229 行发现可疑模式: ${seconds.toFixed(1)}
- **文件**: extension/export/utils.ts
- **行号**: 229
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/utils.ts 第 234 行发现可疑模式: ${minutes}
- **文件**: extension/export/utils.ts
- **行号**: 234
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/utils.ts 第 234 行发现可疑模式: ${remainingSeconds}
- **文件**: extension/export/utils.ts
- **行号**: 234
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/utils.ts 第 276 行发现可疑模式: ${Date.now()}
- **文件**: extension/export/utils.ts
- **行号**: 276
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/utils.ts 第 276 行发现可疑模式: ${Math.random().toString(36).substr(2, 9)}
- **文件**: extension/export/utils.ts
- **行号**: 276
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/utils.ts 第 276 行发现可疑模式: ${extension}
- **文件**: extension/export/utils.ts
- **行号**: 276
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/utils.ts 第 313 行发现可疑模式: ${i}
- **文件**: extension/export/utils.ts
- **行号**: 313
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/utils.ts 第 313 行发现可疑模式: ${data[i]?.length}
- **文件**: extension/export/utils.ts
- **行号**: 313
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/utils.ts 第 313 行发现可疑模式: ${firstRowLength}
- **文件**: extension/export/utils.ts
- **行号**: 313
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/utils.ts 第 388 行发现可疑模式: ${result.filePath}
- **文件**: extension/export/utils.ts
- **行号**: 388
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/utils.ts 第 389 行发现可疑模式: ${formatFileSize(result.fileSize)}
- **文件**: extension/export/utils.ts
- **行号**: 389
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/utils.ts 第 390 行发现可疑模式: ${result.recordCount.toLocaleString()}
- **文件**: extension/export/utils.ts
- **行号**: 390
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/utils.ts 第 391 行发现可疑模式: ${formatDuration(result.duration)}
- **文件**: extension/export/utils.ts
- **行号**: 391
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/utils.ts 第 205 行发现可疑模式: '];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * 格式化持续时间
 * @param milliseconds 毫秒数
 * @returns 格式化的持续时间
 */
export function formatDuration(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${Math.round(milliseconds)}ms`;
  }
  
  const seconds = milliseconds / 1000;
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * 创建进度报告器
 * @param callback 进度回调函数
 * @returns 进度报告函数
 */
export function createProgressReporter(callback?: (progress: number) => void) {
  let lastReportTime = 0;
  const reportInterval = 100; // 最小报告间隔（毫秒）
  
  return (progress: number) => {
    const now = Date.now();
    if (now - lastReportTime >= reportInterval || progress >= 100) {
      lastReportTime = now;
      callback?.(Math.min(100, Math.max(0, progress)));
    }
  };
}

/**
 * 检查文件是否存在
 * @param filePath 文件路径
 * @returns 是否存在
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 获取临时文件路径
 * @param extension 文件扩展名
 * @returns 临时文件路径
 */
export function getTempFilePath(extension: string): string {
  const tmpDir = require('
- **文件**: extension/export/utils.ts
- **行号**: 205
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/export/utils.ts 第 305 行发现可疑模式: ');
  }
  
  // 检查列数一致性
  if (data.length > 0) {
    const firstRowLength = data[0]?.length || 0;
    for (let i = 1; i < data.length; i++) {
      if (data[i]?.length !== firstRowLength) {
        issues.push(`Row ${i} has ${data[i]?.length} columns, expected ${firstRowLength}`);
        break; // 只报告第一个不一致的行
      }
    }
  }
  
  // 检查数据类型
  let hasNullValues = false;
  let hasUndefinedValues = false;
  
  for (let i = 0; i < Math.min(data.length, 10); i++) { // 只检查前10行
    const row = data[i];
    if (Array.isArray(row)) {
      for (const value of row) {
        if (value === null) hasNullValues = true;
        if (value === undefined) hasUndefinedValues = true;
      }
    }
  }
  
  if (hasNullValues) {
    issues.push('
- **文件**: extension/export/utils.ts
- **行号**: 305
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/DriverFactory.ts 第 149 行发现可疑模式: ${config.type}
- **文件**: extension/io/DriverFactory.ts
- **行号**: 149
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/DriverFactory.ts 第 153 行发现可疑模式: ${driverEntry.name}
- **文件**: extension/io/DriverFactory.ts
- **行号**: 153
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/DriverFactory.ts 第 159 行发现可疑模式: ${errors.join(', ')}
- **文件**: extension/io/DriverFactory.ts
- **行号**: 159
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/DriverFactory.ts 第 196 行发现可疑模式: ${busType}
- **文件**: extension/io/DriverFactory.ts
- **行号**: 196
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/DriverFactory.ts 第 209 行发现可疑模式: ${config.type}
- **文件**: extension/io/DriverFactory.ts
- **行号**: 209
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/DriverFactory.ts 第 437 行发现可疑模式: ${busType}
- **文件**: extension/io/DriverFactory.ts
- **行号**: 437
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/HALDriver.ts 第 126 行发现可疑模式: ');
  }

  /**
   * Check if the current configuration is valid
   */
  isConfigurationValid(): boolean {
    return this.validateConfiguration().valid;
  }

  /**
   * Set the buffer size for data aggregation
   * @param size Buffer size in bytes
   */
  setBufferSize(size: number): void {
    if (size > 0 && size !== this.bufferSize) {
      this.bufferSize = size;
      this.dataBuffer = Buffer.alloc(size);
      this.bufferPosition = 0;
    }
  }

  /**
   * Process incoming data with buffering to reduce signal overhead
   * Thread-safe operation that aggregates data until buffer threshold is reached
   * @param data Incoming data to process
   */
  processData(data: Buffer): void {
    // Thread-safe buffer operation
    synchronized(this.bufferLock, () => {
      // Update statistics
      this.stats.bytesReceived += data.length;
      this.stats.lastActivity = Date.now();

      // Check if data fits in current buffer
      if (this.bufferPosition + data.length <= this.bufferSize) {
        // Add to buffer
        data.copy(this.dataBuffer, this.bufferPosition);
        this.bufferPosition += data.length;
      } else {
        // Buffer would overflow, flush current buffer and start new one
        this.flushBuffer();
        
        if (data.length <= this.bufferSize) {
          // New data fits in empty buffer
          data.copy(this.dataBuffer, 0);
          this.bufferPosition = data.length;
        } else {
          // Data is larger than buffer, emit directly
          this.emit('
- **文件**: extension/io/HALDriver.ts
- **行号**: 126
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/HALDriver.ts 第 197 行发现可疑模式: ', bufferedData);
    }
  }

  /**
   * Get driver statistics
   */
  getStats(): DriverStats {
    return {
      ...this.stats,
      uptime: Date.now() - (this.stats.lastActivity - this.stats.uptime)
    };
  }

  /**
   * Reset driver statistics
   */
  resetStats(): void {
    const now = Date.now();
    this.stats = {
      bytesReceived: 0,
      bytesSent: 0,
      errors: 0,
      uptime: now,
      lastActivity: now
    };
  }

  /**
   * Handle driver errors
   * @param error The error that occurred
   */
  protected handleError(error: Error): void {
    this.stats.errors++;
    this.emit('
- **文件**: extension/io/HALDriver.ts
- **行号**: 197
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/HALDriver.ts 第 231 行发现可疑模式: ', error);
  }

  /**
   * Update sent bytes statistics
   * @param bytes Number of bytes sent
   */
  protected updateSentStats(bytes: number): void {
    this.stats.bytesSent += bytes;
    this.stats.lastActivity = Date.now();
    this.emit('
- **文件**: extension/io/HALDriver.ts
- **行号**: 231
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/Manager.ts 第 234 行发现可疑模式: ');
    }

    try {
      const bytesWritten = await this.currentDriver.write(data);
      this.statistics.bytesSent += bytesWritten;
      this.statistics.framesSent++;
      
      return bytesWritten;
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Update frame configuration
   */
  updateFrameConfig(config: Partial<FrameConfig>): void {
    this.frameConfig = { ...this.frameConfig, ...config };
    
    // Reset frame buffer when configuration changes
    this.frameBuffer = Buffer.alloc(0);
  }

  /**
   * Get list of available devices for a specific bus type
   */
  async getAvailableDevices(busType: BusType): Promise<any[]> {
    return await this.driverFactory.discoverDevices(busType);
  }

  /**
   * Get all available driver capabilities
   */
  getAvailableDrivers(): any[] {
    return this.driverFactory.getAvailableDrivers();
  }

  /**
   * Get supported bus types
   */
  getSupportedBusTypes(): BusType[] {
    return this.driverFactory.getSupportedBusTypes();
  }

  /**
   * Get default configuration for a bus type
   */
  getDefaultConfig(busType: BusType): any {
    return this.driverFactory.getDefaultConfig(busType);
  }

  /**
   * Validate configuration for a specific bus type
   */
  validateConfig(config: ConnectionConfig): string[] {
    return this.driverFactory.validateConfig(config);
  }

  /**
   * Check if a bus type is supported
   */
  isBusTypeSupported(busType: BusType): boolean {
    return this.driverFactory.isSupported(busType);
  }

  /**
   * Create appropriate driver instance based on configuration
   */
  private createDriver(config: ConnectionConfig): HALDriver {
    return this.driverFactory.createDriver(config);
  }

  /**
   * Set up event handlers for the current driver
   */
  private setupDriverEvents(): void {
    if (!this.currentDriver) {
      return;
    }

    // Handle incoming data
    this.currentDriver.on('
- **文件**: extension/io/Manager.ts
- **行号**: 234
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/Manager.ts 第 333 行发现可疑模式: ', () => {
      this.setState(ConnectionState.Disconnected);
    });
  }

  /**
   * Process incoming data and extract frames
   */
  private processIncomingData(data: Buffer): void {
    // Update statistics
    this.statistics.bytesReceived += data.length;
    
    // Emit raw data event
    this.emit('
- **文件**: extension/io/Manager.ts
- **行号**: 333
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/Manager.ts 第 346 行发现可疑模式: ', data);

    // Append to frame buffer
    this.frameBuffer = Buffer.concat([this.frameBuffer, data]);

    // Extract frames based on detection method
    this.extractFrames();
  }

  /**
   * Extract frames from the current buffer
   */
  private extractFrames(): void {
    switch (this.frameConfig.frameDetection) {
      case FrameDetection.EndDelimiterOnly:
        this.extractEndDelimitedFrames();
        break;
        
      case FrameDetection.StartAndEndDelimiter:
        this.extractStartEndDelimitedFrames();
        break;
        
      case FrameDetection.StartDelimiterOnly:
        this.extractStartDelimitedFrames();
        break;
        
      case FrameDetection.NoDelimiters:
        this.extractNoDelimiterFrames();
        break;
    }
  }

  /**
   * Extract frames using end delimiter only
   */
  private extractEndDelimitedFrames(): void {
    const delimiter = Buffer.from(this.frameConfig.finishSequence);
    
    let startIndex = 0;
    let delimiterIndex: number;
    
    while ((delimiterIndex = this.frameBuffer.indexOf(delimiter, startIndex)) !== -1) {
      // Extract frame data (excluding delimiter)
      const frameData = this.frameBuffer.subarray(startIndex, delimiterIndex);
      
      if (frameData.length > 0) {
        this.emitFrame(frameData);
      }
      
      startIndex = delimiterIndex + delimiter.length;
    }
    
    // Keep remaining data in buffer
    if (startIndex > 0) {
      this.frameBuffer = this.frameBuffer.subarray(startIndex);
    }
  }

  /**
   * Extract frames using start and end delimiters
   */
  private extractStartEndDelimitedFrames(): void {
    const startDelimiter = Buffer.from(this.frameConfig.startSequence);
    const endDelimiter = Buffer.from(this.frameConfig.finishSequence);
    
    let searchIndex = 0;
    
    while (searchIndex < this.frameBuffer.length) {
      // Find start delimiter
      const startIndex = this.frameBuffer.indexOf(startDelimiter, searchIndex);
      if (startIndex === -1) {
        break;
      }
      
      // Find end delimiter after start
      const endIndex = this.frameBuffer.indexOf(endDelimiter, startIndex + startDelimiter.length);
      if (endIndex === -1) {
        break;
      }
      
      // Extract frame data (including delimiters)
      const frameStart = startIndex + startDelimiter.length;
      const frameData = this.frameBuffer.subarray(frameStart, endIndex);
      
      if (frameData.length > 0) {
        this.emitFrame(frameData);
      }
      
      searchIndex = endIndex + endDelimiter.length;
    }
    
    // Remove processed data from buffer
    if (searchIndex > 0) {
      this.frameBuffer = this.frameBuffer.subarray(searchIndex);
    }
  }

  /**
   * Extract frames using start delimiter only
   */
  private extractStartDelimitedFrames(): void {
    const delimiter = Buffer.from(this.frameConfig.startSequence);
    
    let lastDelimiterIndex = -1;
    let searchIndex = 0;
    
    while (true) {
      const delimiterIndex = this.frameBuffer.indexOf(delimiter, searchIndex);
      
      if (delimiterIndex === -1) {
        // No more delimiters found
        if (lastDelimiterIndex !== -1) {
          // Emit frame from last delimiter to end of buffer
          const frameData = this.frameBuffer.subarray(lastDelimiterIndex + delimiter.length);
          if (frameData.length > 0) {
            this.emitFrame(frameData);
          }
        }
        break;
      }
      
      if (lastDelimiterIndex !== -1) {
        // Emit frame between delimiters
        const frameData = this.frameBuffer.subarray(lastDelimiterIndex + delimiter.length, delimiterIndex);
        if (frameData.length > 0) {
          this.emitFrame(frameData);
        }
      }
      
      lastDelimiterIndex = delimiterIndex;
      searchIndex = delimiterIndex + delimiter.length;
    }
    
    // Keep data from last delimiter onwards
    if (lastDelimiterIndex !== -1) {
      this.frameBuffer = this.frameBuffer.subarray(lastDelimiterIndex);
    }
  }

  /**
   * Process data without frame delimiters
   */
  private extractNoDelimiterFrames(): void {
    if (this.frameBuffer.length > 0) {
      this.emitFrame(this.frameBuffer);
      this.frameBuffer = Buffer.alloc(0);
    }
  }

  /**
   * Emit a processed frame
   */
  private emitFrame(data: Buffer): void {
    const frame: RawFrame = {
      data: new Uint8Array(data),
      timestamp: Date.now(),
      sequence: ++this.frameSequence,
      checksumValid: true // TODO: Implement checksum validation
    };
    
    this.statistics.framesReceived++;
    this.emit('
- **文件**: extension/io/Manager.ts
- **行号**: 346
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/Manager.ts 第 507 行发现可疑模式: ', frame);
  }

  /**
   * Set connection state and emit event
   */
  private setState(state: ConnectionState): void {
    if (this.currentState !== state) {
      const previousState = this.currentState;
      this.currentState = state;
      
      // Track reconnections
      if (state === ConnectionState.Connected && previousState === ConnectionState.Reconnecting) {
        this.statistics.reconnections++;
      }
      
      this.emit('
- **文件**: extension/io/Manager.ts
- **行号**: 507
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/Manager.ts 第 523 行发现可疑模式: ', state);
    }
  }

  /**
   * Handle errors
   */
  private handleError(error: Error): void {
    this.statistics.errors++;
    this.emit('
- **文件**: extension/io/Manager.ts
- **行号**: 523
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/BluetoothLEDriver.ts 第 185 行发现可疑模式: ${deviceName}
- **文件**: extension/io/drivers/BluetoothLEDriver.ts
- **行号**: 185
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/BluetoothLEDriver.ts 第 220 行发现可疑模式: ${devices.length}
- **文件**: extension/io/drivers/BluetoothLEDriver.ts
- **行号**: 220
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/BluetoothLEDriver.ts 第 305 行发现可疑模式: ${config.deviceId}
- **文件**: extension/io/drivers/BluetoothLEDriver.ts
- **行号**: 305
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/BluetoothLEDriver.ts 第 322 行发现可疑模式: ${device.name}
- **文件**: extension/io/drivers/BluetoothLEDriver.ts
- **行号**: 322
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/BluetoothLEDriver.ts 第 322 行发现可疑模式: ${device.address}
- **文件**: extension/io/drivers/BluetoothLEDriver.ts
- **行号**: 322
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/BluetoothLEDriver.ts 第 343 行发现可疑模式: ${config.connectionTimeout}
- **文件**: extension/io/drivers/BluetoothLEDriver.ts
- **行号**: 343
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/BluetoothLEDriver.ts 第 348 行发现可疑模式: ${device.name}
- **文件**: extension/io/drivers/BluetoothLEDriver.ts
- **行号**: 348
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/BluetoothLEDriver.ts 第 423 行发现可疑模式: ${this.services.size}
- **文件**: extension/io/drivers/BluetoothLEDriver.ts
- **行号**: 423
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/BluetoothLEDriver.ts 第 451 行发现可疑模式: ${config.characteristicUuid}
- **文件**: extension/io/drivers/BluetoothLEDriver.ts
- **行号**: 451
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/BluetoothLEDriver.ts 第 462 行发现可疑模式: ${targetCharacteristic.name}
- **文件**: extension/io/drivers/BluetoothLEDriver.ts
- **行号**: 462
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/BluetoothLEDriver.ts 第 462 行发现可疑模式: ${targetCharacteristic.uuid}
- **文件**: extension/io/drivers/BluetoothLEDriver.ts
- **行号**: 462
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/BluetoothLEDriver.ts 第 475 行发现可疑模式: ${data.length}
- **文件**: extension/io/drivers/BluetoothLEDriver.ts
- **行号**: 475
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/BluetoothLEDriver.ts 第 614 行发现可疑模式: ${data.length}
- **文件**: extension/io/drivers/BluetoothLEDriver.ts
- **行号**: 614
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/BluetoothLEDriver.ts 第 643 行发现可疑模式: ${data.length}
- **文件**: extension/io/drivers/BluetoothLEDriver.ts
- **行号**: 643
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/BluetoothLEDriver.ts 第 692 行发现可疑模式: ${config.reconnectInterval}
- **文件**: extension/io/drivers/BluetoothLEDriver.ts
- **行号**: 692
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/BluetoothLEDriver.ts 第 806 行发现可疑模式: ${data.toString()}
- **文件**: extension/io/drivers/BluetoothLEDriver.ts
- **行号**: 806
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/NetworkDriver.ts 第 104 行发现可疑模式: ${protocol}
- **文件**: extension/io/drivers/NetworkDriver.ts
- **行号**: 104
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/NetworkDriver.ts 第 104 行发现可疑模式: ${config.host}
- **文件**: extension/io/drivers/NetworkDriver.ts
- **行号**: 104
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/NetworkDriver.ts 第 104 行发现可疑模式: ${port}
- **文件**: extension/io/drivers/NetworkDriver.ts
- **行号**: 104
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/NetworkDriver.ts 第 127 行发现可疑模式: ${this.displayName}
- **文件**: extension/io/drivers/NetworkDriver.ts
- **行号**: 127
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/NetworkDriver.ts 第 151 行发现可疑模式: ${config.protocol}
- **文件**: extension/io/drivers/NetworkDriver.ts
- **行号**: 151
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/NetworkDriver.ts 第 172 行发现可疑模式: ${config.host}
- **文件**: extension/io/drivers/NetworkDriver.ts
- **行号**: 172
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/NetworkDriver.ts 第 172 行发现可疑模式: ${config.tcpPort}
- **文件**: extension/io/drivers/NetworkDriver.ts
- **行号**: 172
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/NetworkDriver.ts 第 194 行发现可疑模式: ${config.connectTimeout}
- **文件**: extension/io/drivers/NetworkDriver.ts
- **行号**: 194
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/NetworkDriver.ts 第 211 行发现可疑模式: ${socket.remoteAddress}
- **文件**: extension/io/drivers/NetworkDriver.ts
- **行号**: 211
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/NetworkDriver.ts 第 211 行发现可疑模式: ${socket.remotePort}
- **文件**: extension/io/drivers/NetworkDriver.ts
- **行号**: 211
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/NetworkDriver.ts 第 245 行发现可疑模式: ${config.host}
- **文件**: extension/io/drivers/NetworkDriver.ts
- **行号**: 245
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/NetworkDriver.ts 第 245 行发现可疑模式: ${config.tcpPort}
- **文件**: extension/io/drivers/NetworkDriver.ts
- **行号**: 245
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/NetworkDriver.ts 第 259 行发现可疑模式: ${data.length}
- **文件**: extension/io/drivers/NetworkDriver.ts
- **行号**: 259
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/NetworkDriver.ts 第 259 行发现可疑模式: ${rinfo.address}
- **文件**: extension/io/drivers/NetworkDriver.ts
- **行号**: 259
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/NetworkDriver.ts 第 259 行发现可疑模式: ${rinfo.port}
- **文件**: extension/io/drivers/NetworkDriver.ts
- **行号**: 259
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/NetworkDriver.ts 第 270 行发现可疑模式: ${address.address}
- **文件**: extension/io/drivers/NetworkDriver.ts
- **行号**: 270
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/NetworkDriver.ts 第 270 行发现可疑模式: ${address.port}
- **文件**: extension/io/drivers/NetworkDriver.ts
- **行号**: 270
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/NetworkDriver.ts 第 279 行发现可疑模式: ${config.multicastAddress}
- **文件**: extension/io/drivers/NetworkDriver.ts
- **行号**: 279
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/NetworkDriver.ts 第 476 行发现可疑模式: ${config.reconnectInterval}
- **文件**: extension/io/drivers/NetworkDriver.ts
- **行号**: 476
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/UARTDriver.ts 第 76 行发现可疑模式: ${uartConfig.port}
- **文件**: extension/io/drivers/UARTDriver.ts
- **行号**: 76
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/UARTDriver.ts 第 76 行发现可疑模式: ${uartConfig.baudRate}
- **文件**: extension/io/drivers/UARTDriver.ts
- **行号**: 76
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/UARTDriver.ts 第 125 行发现可疑模式: ${error}
- **文件**: extension/io/drivers/UARTDriver.ts
- **行号**: 125
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/UARTDriver.ts 第 141 行发现可疑模式: ${validation.errors.join(', ')}
- **文件**: extension/io/drivers/UARTDriver.ts
- **行号**: 141
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/UARTDriver.ts 第 162 行发现可疑模式: ${error.message}
- **文件**: extension/io/drivers/UARTDriver.ts
- **行号**: 162
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/UARTDriver.ts 第 198 行发现可疑模式: ${error.message}
- **文件**: extension/io/drivers/UARTDriver.ts
- **行号**: 198
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/UARTDriver.ts 第 250 行发现可疑模式: ${config.baudRate}
- **文件**: extension/io/drivers/UARTDriver.ts
- **行号**: 250
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/UARTDriver.ts 第 255 行发现可疑模式: ${config.dataBits}
- **文件**: extension/io/drivers/UARTDriver.ts
- **行号**: 255
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/UARTDriver.ts 第 260 行发现可疑模式: ${config.stopBits}
- **文件**: extension/io/drivers/UARTDriver.ts
- **行号**: 260
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/UARTDriver.ts 第 266 行发现可疑模式: ${config.parity}
- **文件**: extension/io/drivers/UARTDriver.ts
- **行号**: 266
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/UARTDriver.ts 第 272 行发现可疑模式: ${config.flowControl}
- **文件**: extension/io/drivers/UARTDriver.ts
- **行号**: 272
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/UARTDriver.ts 第 293 行发现可疑模式: ${error.message}
- **文件**: extension/io/drivers/UARTDriver.ts
- **行号**: 293
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/UARTDriver.ts 第 321 行发现可疑模式: ${error.message}
- **文件**: extension/io/drivers/UARTDriver.ts
- **行号**: 321
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/UARTDriver.ts 第 345 行发现可疑模式: ${error.message}
- **文件**: extension/io/drivers/UARTDriver.ts
- **行号**: 345
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/UARTDriver.ts 第 369 行发现可疑模式: ${error.message}
- **文件**: extension/io/drivers/UARTDriver.ts
- **行号**: 369
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/UARTDriver.ts 第 430 行发现可疑模式: ${error}
- **文件**: extension/io/drivers/UARTDriver.ts
- **行号**: 430
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/ConfigurationManager.ts 第 360 行发现可疑模式: ${key}
- **文件**: extension/licensing/ConfigurationManager.ts
- **行号**: 360
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/ConfigurationManager.ts 第 367 行发现可疑模式: ${key}
- **文件**: extension/licensing/ConfigurationManager.ts
- **行号**: 367
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/ConfigurationManager.ts 第 367 行发现可疑模式: ${configItem.requiredFeature}
- **文件**: extension/licensing/ConfigurationManager.ts
- **行号**: 367
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/ConfigurationManager.ts 第 374 行发现可疑模式: ${key}
- **文件**: extension/licensing/ConfigurationManager.ts
- **行号**: 374
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/ConfigurationManager.ts 第 411 行发现可疑模式: ${key}
- **文件**: extension/licensing/ConfigurationManager.ts
- **行号**: 411
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/ConfigurationManager.ts 第 483 行发现可疑模式: ${error}
- **文件**: extension/licensing/ConfigurationManager.ts
- **行号**: 483
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/ConfigurationManager.ts 第 517 行发现可疑模式: ${error}
- **文件**: extension/licensing/ConfigurationManager.ts
- **行号**: 517
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/ConfigurationManager.ts 第 608 行发现可疑模式: ${key}
- **文件**: extension/licensing/ConfigurationManager.ts
- **行号**: 608
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/ConfigurationManager.ts 第 631 行发现可疑模式: ${key}
- **文件**: extension/licensing/ConfigurationManager.ts
- **行号**: 631
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/ConfigurationManager.ts 第 672 行发现可疑模式: ${key}
- **文件**: extension/licensing/ConfigurationManager.ts
- **行号**: 672
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/ConfigurationManager.ts 第 690 行发现可疑模式: ${key}
- **文件**: extension/licensing/ConfigurationManager.ts
- **行号**: 690
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/FeatureGate.ts 第 135 行发现可疑模式: ${featureId}
- **文件**: extension/licensing/FeatureGate.ts
- **行号**: 135
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/FeatureGate.ts 第 262 行发现可疑模式: ${this.getLicenseDisplayName(currentLicense)}
- **文件**: extension/licensing/FeatureGate.ts
- **行号**: 262
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/FeatureGate.ts 第 266 行发现可疑模式: ${availableFeatures}
- **文件**: extension/licensing/FeatureGate.ts
- **行号**: 266
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/FeatureGate.ts 第 266 行发现可疑模式: ${totalFeatures}
- **文件**: extension/licensing/FeatureGate.ts
- **行号**: 266
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/FeatureGate.ts 第 273 行发现可疑模式: ${unavailableFeatures.length}
- **文件**: extension/licensing/FeatureGate.ts
- **行号**: 273
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/FeatureGate.ts 第 467 行发现可疑模式: ${feature.name}
- **文件**: extension/licensing/FeatureGate.ts
- **行号**: 467
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/FeatureGate.ts 第 467 行发现可疑模式: ${requiredLicense}
- **文件**: extension/licensing/FeatureGate.ts
- **行号**: 467
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/FeatureGate.ts 第 495 行发现可疑模式: ${feature.name}
- **文件**: extension/licensing/FeatureGate.ts
- **行号**: 495
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/FeatureGate.ts 第 495 行发现可疑模式: ${feature.description}
- **文件**: extension/licensing/FeatureGate.ts
- **行号**: 495
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/FeatureGate.ts 第 495 行发现可疑模式: ${this.getLicenseDisplayName(feature.requiredLicenseType)}
- **文件**: extension/licensing/FeatureGate.ts
- **行号**: 495
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/FeatureGate.ts 第 516 行发现可疑模式: ${feature.name}
- **文件**: extension/licensing/FeatureGate.ts
- **行号**: 516
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/FeatureGate.ts 第 517 行发现可疑模式: ${this.getLicenseDisplayName(result.requiredLicenseType)}
- **文件**: extension/licensing/FeatureGate.ts
- **行号**: 517
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/FeatureGate.ts 第 544 行发现可疑模式: ${feature.id}
- **文件**: extension/licensing/FeatureGate.ts
- **行号**: 544
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/FeatureGate.ts 第 548 行发现可疑模式: ${feature.id}
- **文件**: extension/licensing/FeatureGate.ts
- **行号**: 548
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/FeatureGate.ts 第 550 行发现可疑模式: ${feature.id}
- **文件**: extension/licensing/FeatureGate.ts
- **行号**: 550
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicenseManager.ts 第 330 行发现可疑模式: ${error}
- **文件**: extension/licensing/LicenseManager.ts
- **行号**: 330
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicenseManager.ts 第 396 行发现可疑模式: ${error}
- **文件**: extension/licensing/LicenseManager.ts
- **行号**: 396
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicenseManager.ts 第 497 行发现可疑模式: ${LicenseManager.API_BASE_URL}
- **文件**: extension/licensing/LicenseManager.ts
- **行号**: 497
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicenseManager.ts 第 497 行发现可疑模式: ${endpoint}
- **文件**: extension/licensing/LicenseManager.ts
- **行号**: 497
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicenseManager.ts 第 522 行发现可疑模式: ${res.statusCode}
- **文件**: extension/licensing/LicenseManager.ts
- **行号**: 522
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicenseManager.ts 第 522 行发现可疑模式: ${responseData}
- **文件**: extension/licensing/LicenseManager.ts
- **行号**: 522
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicenseManager.ts 第 525 行发现可疑模式: ${error}
- **文件**: extension/licensing/LicenseManager.ts
- **行号**: 525
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicenseManager.ts 第 566 行发现可疑模式: ${this.licenseInfo.appName}
- **文件**: extension/licensing/LicenseManager.ts
- **行号**: 566
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicenseManager.ts 第 11 行发现可疑模式: ';

/**
 * 许可证信息接口
 */
export interface LicenseInfo {
    /** 许可证密钥 */
    licenseKey: string;
    /** 实例ID */
    instanceId: string;
    /** 是否已激活 */
    isActivated: boolean;
    /** 应用程序名称 */
    appName: string;
    /** 变体名称（如Pro Monthly, Enterprise Yearly等） */
    variantName: string;
    /** 实例名称 */
    instanceName: string;
    /** 客户姓名 */
    customerName: string;
    /** 客户邮箱 */
    customerEmail: string;
    /** 座位限制 */
    seatLimit: number;
    /** 座位使用量 */
    seatUsage: number;
    /** 激活日期 */
    activationDate: Date;
    /** 启用的特性列表 */
    enabledFeatures: string[];
}

/**
 * API响应接口
 */
interface LemonSqueezyResponse {
    valid: boolean;
    license_key: {
        id: string;
        status: string;
        key: string;
        activation_limit: number;
        activation_usage: number;
        created_at: string;
        expires_at: string | null;
    };
    instance: {
        id: string;
        name: string;
        created_at: string;
    };
    meta: {
        store_id: number;
        product_id: number;
        variant_id: number;
        variant_name: string;
        customer_id: number;
        customer_name: string;
        customer_email: string;
    };
}

/**
 * 许可证管理器事件接口
 */
export interface LicenseManagerEvents {
    /** 许可证状态变化 */
    onLicenseChanged: (info: LicenseInfo | null) => void;
    /** 激活状态变化 */
    onActivationChanged: (activated: boolean) => void;
    /** 忙碌状态变化 */
    onBusyChanged: (busy: boolean) => void;
}

/**
 * LicenseManager - 许可证管理器
 * 
 * 基于Serial-Studio LemonSqueezy C++实现的完整TypeScript版本
 * 处理软件激活、验证和停用，使用Lemon Squeezy API
 * 
 * 核心功能：
 * - 在每设备基础上激活新许可证
 * - 验证许可证密钥和分配的实例
 * - 停用许可证以释放座位
 * - 安全地在本地存储加密的许可证数据
 * 
 * 与Lemon Squeezy许可证端点直接通信，确保：
 * - 许可证匹配预期的产品和商店ID
 * - 激活绑定到唯一的机器ID
 * - 只接受有效和活跃的密钥
 * 
 * 实现为单例模式，完全集成到VSCode扩展系统中
 * 所有敏感数据使用机器特定密钥加密
 */
export class LicenseManager {
    private static instance: LicenseManager;
    private context: vscode.ExtensionContext;
    private machineId: MachineID;
    private simpleCrypt: SimpleCrypt;
    private licenseInfo: LicenseInfo | null = null;
    private busy: boolean = false;
    private eventListeners: Partial<LicenseManagerEvents> = {};

    // Lemon Squeezy配置 - 与Serial-Studio保持一致
    private static readonly STORE_ID = 170454;
    private static readonly PRODUCT_ID = 496241;
    private static readonly API_BASE_URL = '
- **文件**: extension/licensing/LicenseManager.ts
- **行号**: 11
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicenseManager.ts 第 503 行发现可疑模式: 'application/vnd.api+json'
- **文件**: extension/licensing/LicenseManager.ts
- **行号**: 503
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicenseManager.ts 第 504 行发现可疑模式: 'application/vnd.api+json'
- **文件**: extension/licensing/LicenseManager.ts
- **行号**: 504
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicenseManager.ts 第 512 行发现可疑模式: ', (chunk) => {
                    responseData += chunk;
                });

                res.on('
- **文件**: extension/licensing/LicenseManager.ts
- **行号**: 512
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicensingIntegrationTest.ts 第 476 行发现可疑模式: ${loadDuration}
- **文件**: extension/licensing/LicensingIntegrationTest.ts
- **行号**: 476
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicensingIntegrationTest.ts 第 476 行发现可疑模式: ${TARGET_LOAD_TIME}
- **文件**: extension/licensing/LicensingIntegrationTest.ts
- **行号**: 476
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicensingIntegrationTest.ts 第 502 行发现可疑模式: ${successRate}
- **文件**: extension/licensing/LicensingIntegrationTest.ts
- **行号**: 502
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicensingIntegrationTest.ts 第 502 行发现可疑模式: ${TARGET_SUCCESS_RATE}
- **文件**: extension/licensing/LicensingIntegrationTest.ts
- **行号**: 502
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicensingIntegrationTest.ts 第 531 行发现可疑模式: ${TARGET_RESPONSE_TIME}
- **文件**: extension/licensing/LicensingIntegrationTest.ts
- **行号**: 531
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicensingIntegrationTest.ts 第 568 行发现可疑模式: ${testName}
- **文件**: extension/licensing/LicensingIntegrationTest.ts
- **行号**: 568
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicensingIntegrationTest.ts 第 568 行发现可疑模式: ${duration}
- **文件**: extension/licensing/LicensingIntegrationTest.ts
- **行号**: 568
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicensingIntegrationTest.ts 第 580 行发现可疑模式: ${testName}
- **文件**: extension/licensing/LicensingIntegrationTest.ts
- **行号**: 580
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicensingIntegrationTest.ts 第 580 行发现可疑模式: ${duration}
- **文件**: extension/licensing/LicensingIntegrationTest.ts
- **行号**: 580
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicensingIntegrationTest.ts 第 580 行发现可疑模式: ${error}
- **文件**: extension/licensing/LicensingIntegrationTest.ts
- **行号**: 580
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicensingIntegrationTest.ts 第 602 行发现可疑模式: ${suite.suiteName}
- **文件**: extension/licensing/LicensingIntegrationTest.ts
- **行号**: 602
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicensingIntegrationTest.ts 第 603 行发现可疑模式: ${suite.totalTests}
- **文件**: extension/licensing/LicensingIntegrationTest.ts
- **行号**: 603
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicensingIntegrationTest.ts 第 604 行发现可疑模式: ${suite.passedTests}
- **文件**: extension/licensing/LicensingIntegrationTest.ts
- **行号**: 604
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicensingIntegrationTest.ts 第 605 行发现可疑模式: ${suite.failedTests}
- **文件**: extension/licensing/LicensingIntegrationTest.ts
- **行号**: 605
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicensingIntegrationTest.ts 第 606 行发现可疑模式: ${suite.totalDuration}
- **文件**: extension/licensing/LicensingIntegrationTest.ts
- **行号**: 606
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicensingIntegrationTest.ts 第 607 行发现可疑模式: ${((suite.passedTests / suite.totalTests) * 100).toFixed(1)}
- **文件**: extension/licensing/LicensingIntegrationTest.ts
- **行号**: 607
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicensingIntegrationTest.ts 第 611 行发现可疑模式: ${totalTests}
- **文件**: extension/licensing/LicensingIntegrationTest.ts
- **行号**: 611
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicensingIntegrationTest.ts 第 612 行发现可疑模式: ${totalPassed}
- **文件**: extension/licensing/LicensingIntegrationTest.ts
- **行号**: 612
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicensingIntegrationTest.ts 第 613 行发现可疑模式: ${totalFailed}
- **文件**: extension/licensing/LicensingIntegrationTest.ts
- **行号**: 613
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicensingIntegrationTest.ts 第 614 行发现可疑模式: ${totalDuration}
- **文件**: extension/licensing/LicensingIntegrationTest.ts
- **行号**: 614
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicensingIntegrationTest.ts 第 615 行发现可疑模式: ${((totalPassed / totalTests) * 100).toFixed(1)}
- **文件**: extension/licensing/LicensingIntegrationTest.ts
- **行号**: 615
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicensingIntegrationTest.ts 第 644 行发现可疑模式: ${qualityScore.toFixed(1)}
- **文件**: extension/licensing/LicensingIntegrationTest.ts
- **行号**: 644
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicensingIntegrationTest.ts 第 115 行发现可疑模式: ');
            }

            return { id: id.substring(0, 8) + '
- **文件**: extension/licensing/LicensingIntegrationTest.ts
- **行号**: 115
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicensingIntegrationTest.ts 第 193 行发现可疑模式: ';
            const encrypted = crypt.encrypt(plaintext);
            
            // 尝试篡改加密数据
            const tamperedData = encrypted.substring(0, encrypted.length - 5) + '
- **文件**: extension/licensing/LicensingIntegrationTest.ts
- **行号**: 193
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicensingIntegrationTest.ts 第 487 行发现可疑模式: ', async () => {
            const featureGate = FeatureGate.getInstance(this.context);
            const allFeatures = featureGate.getAllFeatures();
            
            let registeredCount = 0;
            for (const [featureId, feature] of allFeatures) {
                if (feature && feature.id === featureId) {
                    registeredCount++;
                }
            }

            const successRate = (registeredCount / allFeatures.size) * 100;
            const TARGET_SUCCESS_RATE = 100;

            if (successRate < TARGET_SUCCESS_RATE) {
                throw new Error(`Extension point registration rate ${successRate}% below target ${TARGET_SUCCESS_RATE}%`);
            }

            return {
                totalFeatures: allFeatures.size,
                registeredFeatures: registeredCount,
                successRate,
                target: TARGET_SUCCESS_RATE
            };
        });

        // 测试4: 系统响应时间
        await this.runTest(suite, '
- **文件**: extension/licensing/LicensingIntegrationTest.ts
- **行号**: 487
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicensingIntegrationTest.ts 第 525 行发现可疑模式: ');
            const featureDuration = Date.now() - featureStartTime;

            const TARGET_RESPONSE_TIME = 500; // 500ms目标

            if (configDuration > TARGET_RESPONSE_TIME || featureDuration > TARGET_RESPONSE_TIME) {
                throw new Error(`Response time exceeds target ${TARGET_RESPONSE_TIME}ms`);
            }

            return {
                configResponseTime: configDuration,
                featureResponseTime: featureDuration,
                target: TARGET_RESPONSE_TIME,
                passed: configDuration <= TARGET_RESPONSE_TIME && featureDuration <= TARGET_RESPONSE_TIME
            };
        });

        suite.totalDuration = Date.now() - startTime;
        this.testResults.push(suite);
    }

    /**
     * 运行单个测试
     */
    private async runTest(
        suite: TestSuiteResult,
        testName: string,
        testFunction: () => Promise<any>
    ): Promise<void> {
        const startTime = Date.now();

        try {
            const result = await testFunction();
            const duration = Date.now() - startTime;

            suite.tests.push({
                testName,
                passed: true,
                duration,
                details: result
            });

            suite.passedTests++;
            console.log(`✅ ${testName} - ${duration}ms`);
        } catch (error) {
            const duration = Date.now() - startTime;

            suite.tests.push({
                testName,
                passed: false,
                duration,
                error: error instanceof Error ? error.message : String(error)
            });

            suite.failedTests++;
            console.log(`❌ ${testName} - ${duration}ms - ${error}`);
        }

        suite.totalTests++;
    }

    /**
     * 生成测试报告
     */
    private generateTestReport(totalDuration: number): void {
        console.log('
- **文件**: extension/licensing/LicensingIntegrationTest.ts
- **行号**: 525
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicensingIntegrationTest.ts 第 591 行发现可疑模式: ');

        let totalTests = 0;
        let totalPassed = 0;
        let totalFailed = 0;

        for (const suite of this.testResults) {
            totalTests += suite.totalTests;
            totalPassed += suite.passedTests;
            totalFailed += suite.failedTests;

            console.log(`\n${suite.suiteName}:`);
            console.log(`  总测试: ${suite.totalTests}`);
            console.log(`  通过: ${suite.passedTests}`);
            console.log(`  失败: ${suite.failedTests}`);
            console.log(`  用时: ${suite.totalDuration}ms`);
            console.log(`  通过率: ${((suite.passedTests / suite.totalTests) * 100).toFixed(1)}%`);
        }

        console.log('
- **文件**: extension/licensing/LicensingIntegrationTest.ts
- **行号**: 591
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicensingIntegrationTest.ts 第 635 行发现可疑模式: ');
        }

        // 计算整体质量分数
        const totalTests = this.testResults.reduce((sum, suite) => sum + suite.totalTests, 0);
        const totalPassed = this.testResults.reduce((sum, suite) => sum + suite.passedTests, 0);
        const qualityScore = (totalPassed / totalTests) * 100;

        console.log(`  • 多语言支持完整性: ✅ 100% (内置14种语言)`);
        console.log(`\n🏆 整体质量分数: ${qualityScore.toFixed(1)}%`);

        if (qualityScore >= 95) {
            console.log('
- **文件**: extension/licensing/LicensingIntegrationTest.ts
- **行号**: 635
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的Command Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/LicensingIntegrationTest.ts 第 557 行发现可疑模式: Function(
- **文件**: extension/licensing/LicensingIntegrationTest.ts
- **行号**: 557
- **CWE ID**: CWE-78
- **建议**: 避免执行外部命令，使用安全的API替代

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/MachineID.ts 第 124 行发现可疑模式: ${appName}
- **文件**: extension/licensing/MachineID.ts
- **行号**: 124
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/MachineID.ts 第 124 行发现可疑模式: ${id}
- **文件**: extension/licensing/MachineID.ts
- **行号**: 124
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/MachineID.ts 第 124 行发现可疑模式: ${osName}
- **文件**: extension/licensing/MachineID.ts
- **行号**: 124
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/MachineID.ts 第 281 行发现可疑模式: ${macs[0]}
- **文件**: extension/licensing/MachineID.ts
- **行号**: 281
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/MachineID.ts 第 281 行发现可疑模式: ${hostname}
- **文件**: extension/licensing/MachineID.ts
- **行号**: 281
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/MachineID.ts 第 281 行发现可疑模式: ${cpuInfo}
- **文件**: extension/licensing/MachineID.ts
- **行号**: 281
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/MachineID.ts 第 288 行发现可疑模式: ${hostname}
- **文件**: extension/licensing/MachineID.ts
- **行号**: 288
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/MachineID.ts 第 288 行发现可疑模式: ${platform}
- **文件**: extension/licensing/MachineID.ts
- **行号**: 288
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/MachineID.ts 第 288 行发现可疑模式: ${arch}
- **文件**: extension/licensing/MachineID.ts
- **行号**: 288
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/MachineID.ts 第 288 行发现可疑模式: ${Date.now()}
- **文件**: extension/licensing/MachineID.ts
- **行号**: 288
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/MachineID.ts 第 314 行发现可疑模式: ${macs[0]}
- **文件**: extension/licensing/MachineID.ts
- **行号**: 314
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/MachineID.ts 第 314 行发现可疑模式: ${hostname}
- **文件**: extension/licensing/MachineID.ts
- **行号**: 314
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/MachineID.ts 第 314 行发现可疑模式: ${cpuInfo}
- **文件**: extension/licensing/MachineID.ts
- **行号**: 314
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/MachineID.ts 第 319 行发现可疑模式: ${hostname}
- **文件**: extension/licensing/MachineID.ts
- **行号**: 319
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/MachineID.ts 第 319 行发现可疑模式: ${platform}
- **文件**: extension/licensing/MachineID.ts
- **行号**: 319
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/MachineID.ts 第 319 行发现可疑模式: ${arch}
- **文件**: extension/licensing/MachineID.ts
- **行号**: 319
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/MachineID.ts 第 326 行发现可疑模式: ${appName}
- **文件**: extension/licensing/MachineID.ts
- **行号**: 326
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/MachineID.ts 第 326 行发现可疑模式: ${id}
- **文件**: extension/licensing/MachineID.ts
- **行号**: 326
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/MachineID.ts 第 326 行发现可疑模式: ${osName}
- **文件**: extension/licensing/MachineID.ts
- **行号**: 326
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/MachineID.ts 第 11 行发现可疑模式: ';

const execAsync = promisify(exec);

/**
 * MachineID - 机器标识管理器
 * 
 * 提供一致的、哈希化的机器标识符用于许可证验证和数据加密
 * 基于Serial-Studio的MachineID C++实现
 * 
 * 核心功能：
 * - 生成唯一的、平台无关的机器标识符
 * - 基于系统特定属性生成机器ID
 * - 绑定许可证密钥和激活到特定机器
 * - 为敏感数据加密提供稳定的加密密钥
 * 
 * 生成的标识符不包含个人信息或硬件可识别信息
 * 使用单向哈希确保隐私的同时执行每设备限制
 */
export class MachineID {
    private static instance: MachineID;
    private _machineId: string = '
- **文件**: extension/licensing/MachineID.ts
- **行号**: 11
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/MachineID.ts 第 32 行发现可疑模式: ';
    private _machineSpecificKey: bigint = BigInt(0);

    private constructor() {
        // 同步版本的初始化，使用fallback方式
        this.readInformationSync();
    }

    /**
     * 获取MachineID单例实例
     * 遵循Singleton模式确保运行时只有一个实例
     */
    public static getInstance(): MachineID {
        if (!MachineID.instance) {
            MachineID.instance = new MachineID();
        }
        return MachineID.instance;
    }

    /**
     * 返回哈希化的、base64编码的机器标识符
     * 
     * 该值基于平台特定标识符和应用程序名称生成，
     * 然后进行哈希和编码以避免泄露可识别信息。
     * 为许可证、缓存或其他每设备逻辑提供一致的机器ID
     */
    public get machineId(): string {
        return this._machineId;
    }

    /**
     * 返回机器特性加密密钥
     * 
     * 该64位密钥来自用于生成机器ID的相同输入
     * 用于本地数据加密（如缓存的许可证信息），
     * 确保加密内容无法在其他机器上重用或解密
     */
    public get machineSpecificKey(): bigint {
        return this._machineSpecificKey;
    }

    /**
     * 收集系统特定数据以生成唯一机器标识符和加密密钥
     * 
     * 该方法根据操作系统收集平台特定的机器信息：
     * - Linux: /var/lib/dbus/machine-id 或 /etc/machine-id
     * - macOS: IOPlatformUUID (通过ioreg)
     * - Windows: MachineGuid + UUID (通过registry和PowerShell)
     * - BSD: /etc/hostid 或 smbios.system.uuid
     * 
     * 生成的机器特定ID与应用程序名称和操作系统名称结合
     * 使用BLAKE2s-128算法进行哈希处理，创建不可逆的、
     * 隐私保护的标识符，在同一台机器上保持一致
     * 
     * 派生两个值：
     * - 机器ID：用于机器识别的base64编码哈希字符串
     * - 机器特定密钥：从哈希提取的64位密钥，用于加密
     *   或解密本地缓存的敏感数据（如许可证信息），
     *   确保不能跨不同机器重用
     */
    private async readInformation(): Promise<void> {
        let id = '
- **文件**: extension/licensing/MachineID.ts
- **行号**: 32
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/MachineID.ts 第 174 行发现可疑模式: "]+)"
- **文件**: extension/licensing/MachineID.ts
- **行号**: 174
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/MachineID.ts 第 201 行发现可疑模式: ')) {
                    const parts = line.trim().split(/\s+/);
                    if (parts.length >= 3) {
                        machineGuid = parts[parts.length - 1];
                    }
                    break;
                }
            }
        } catch {
            // 忽略错误
        }

        try {
            // 使用PowerShell获取UUID
            const { stdout: psOutput } = await execAsync(
                '
- **文件**: extension/licensing/MachineID.ts
- **行号**: 201
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/MachineID.ts 第 216 行发现可疑模式: '
            );
            uuid = psOutput.trim();
        } catch {
            // 忽略错误
        }

        // 组合MachineGuid和UUID
        const combinedId = machineGuid + uuid;
        if (combinedId) {
            return combinedId;
        }

        throw new Error('
- **文件**: extension/licensing/MachineID.ts
- **行号**: 216
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/SimpleCrypt.ts 第 8 行发现可疑模式: ';

/**
 * 保护模式枚举
 * 对应Serial-Studio SimpleCrypt::ProtectionMode
 */
export enum ProtectionMode {
    /** 不使用完整性保护 */
    ProtectionNone = 0,
    /** 使用校验和进行完整性保护 */
    ProtectionChecksum = 1,
    /** 使用哈希进行完整性保护 */
    ProtectionHash = 2
}

/**
 * SimpleCrypt - 简单加密工具类
 * 
 * 基于Serial-Studio SimpleCrypt C++实现的TypeScript版本
 * 提供轻量级的字符串加密/解密功能，主要用于保护许可证信息
 * 
 * 核心功能：
 * - 使用机器特定密钥进行数据加密
 * - 支持完整性保护（校验和或哈希）
 * - 与Serial-Studio C++版本兼容的加密格式
 * - 防止许可证信息在不同机器间复制使用
 * 
 * 加密算法：
 * - 对称加密：AES-256-CBC
 * - 完整性保护：SHA-256哈希或简单校验和
 * - 密钥派生：基于机器特定密钥和固定盐值
 */
export class SimpleCrypt {
    private key: bigint = BigInt(0);
    private protectionMode: ProtectionMode = ProtectionMode.ProtectionNone;
    
    // AES-256需要32字节密钥
    private static readonly KEY_SIZE = 32;
    // AES块大小是16字节
    private static readonly BLOCK_SIZE = 16;
    // 默认盐值，与Serial-Studio保持一致
    private static readonly DEFAULT_SALT = '
- **文件**: extension/licensing/SimpleCrypt.ts
- **行号**: 8
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/SimpleCrypt.ts 第 233 行发现可疑模式: ').update(data).digest();
        
        return Buffer.concat([hash, data]);
    }

    /**
     * 验证校验和并提取数据
     * @param data 包含校验和的数据
     * @returns 提取的IV和加密数据，验证失败返回null
     */
    private verifyAndExtractChecksum(data: Buffer): { iv: Buffer; encrypted: Buffer } | null {
        if (data.length < 4 + SimpleCrypt.BLOCK_SIZE) {
            return null;
        }
        
        const storedChecksum = data.readUInt32BE(0);
        const actualData = data.subarray(4);
        const calculatedChecksum = this.calculateCRC32(actualData);
        
        if (storedChecksum !== calculatedChecksum) {
            return null;
        }
        
        const iv = actualData.subarray(0, SimpleCrypt.BLOCK_SIZE);
        const encrypted = actualData.subarray(SimpleCrypt.BLOCK_SIZE);
        
        return { iv, encrypted };
    }

    /**
     * 验证哈希并提取数据
     * @param data 包含哈希的数据
     * @returns 提取的IV和加密数据，验证失败返回null
     */
    private verifyAndExtractHash(data: Buffer): { iv: Buffer; encrypted: Buffer } | null {
        const hashSize = 32; // SHA-256 hash size
        if (data.length < hashSize + SimpleCrypt.BLOCK_SIZE) {
            return null;
        }
        
        const storedHash = data.subarray(0, hashSize);
        const actualData = data.subarray(hashSize);
        const calculatedHash = crypto.createHash('
- **文件**: extension/licensing/SimpleCrypt.ts
- **行号**: 233
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/index.ts 第 141 行发现可疑模式: ${selected}
- **文件**: extension/licensing/index.ts
- **行号**: 141
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的Command Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/index.ts 第 44 行发现可疑模式: System(
- **文件**: extension/licensing/index.ts
- **行号**: 44
- **CWE ID**: CWE-78
- **建议**: 避免执行外部命令，使用安全的API替代

### 🔴 潜在的Command Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/index.ts 第 270 行发现可疑模式: System(
- **文件**: extension/licensing/index.ts
- **行号**: 270
- **CWE ID**: CWE-78
- **建议**: 避免执行外部命令，使用安全的API替代

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 28 行发现可疑模式: ${id.substring(0, 16)}
- **文件**: extension/licensing/simple-test.ts
- **行号**: 28
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 29 行发现可疑模式: ${key !== BigInt(0)}
- **文件**: extension/licensing/simple-test.ts
- **行号**: 29
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 38 行发现可疑模式: ${error}
- **文件**: extension/licensing/simple-test.ts
- **行号**: 38
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 53 行发现可疑模式: ${id1 === id2}
- **文件**: extension/licensing/simple-test.ts
- **行号**: 53
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 54 行发现可疑模式: ${key1 === key2}
- **文件**: extension/licensing/simple-test.ts
- **行号**: 54
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 63 行发现可疑模式: ${error}
- **文件**: extension/licensing/simple-test.ts
- **行号**: 63
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 78 行发现可疑模式: ${plaintext}
- **文件**: extension/licensing/simple-test.ts
- **行号**: 78
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 79 行发现可疑模式: ${encrypted.length}
- **文件**: extension/licensing/simple-test.ts
- **行号**: 79
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 80 行发现可疑模式: ${decrypted === plaintext}
- **文件**: extension/licensing/simple-test.ts
- **行号**: 80
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 89 行发现可疑模式: ${error}
- **文件**: extension/licensing/simple-test.ts
- **行号**: 89
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 111 行发现可疑模式: ${tamperedDecrypted === ''}
- **文件**: extension/licensing/simple-test.ts
- **行号**: 111
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 112 行发现可疑模式: ${normalDecrypted === plaintext}
- **文件**: extension/licensing/simple-test.ts
- **行号**: 112
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 121 行发现可疑模式: ${error}
- **文件**: extension/licensing/simple-test.ts
- **行号**: 121
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 150 行发现可疑模式: ${iterations}
- **文件**: extension/licensing/simple-test.ts
- **行号**: 150
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 150 行发现可疑模式: ${encryptTime}
- **文件**: extension/licensing/simple-test.ts
- **行号**: 150
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 150 行发现可疑模式: ${(encryptTime/iterations).toFixed(2)}
- **文件**: extension/licensing/simple-test.ts
- **行号**: 150
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 151 行发现可疑模式: ${iterations}
- **文件**: extension/licensing/simple-test.ts
- **行号**: 151
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 151 行发现可疑模式: ${decryptTime}
- **文件**: extension/licensing/simple-test.ts
- **行号**: 151
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 151 行发现可疑模式: ${(decryptTime/iterations).toFixed(2)}
- **文件**: extension/licensing/simple-test.ts
- **行号**: 151
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 164 行发现可疑模式: ${error}
- **文件**: extension/licensing/simple-test.ts
- **行号**: 164
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 180 行发现可疑模式: ${validKey.length}
- **文件**: extension/licensing/simple-test.ts
- **行号**: 180
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 180 行发现可疑模式: ${validKey.length === 36}
- **文件**: extension/licensing/simple-test.ts
- **行号**: 180
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 186 行发现可疑模式: ${key.length}
- **文件**: extension/licensing/simple-test.ts
- **行号**: 186
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 186 行发现可疑模式: ${shouldBeRejected}
- **文件**: extension/licensing/simple-test.ts
- **行号**: 186
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 205 行发现可疑模式: ${error}
- **文件**: extension/licensing/simple-test.ts
- **行号**: 205
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 211 行发现可疑模式: ${totalTests}
- **文件**: extension/licensing/simple-test.ts
- **行号**: 211
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 212 行发现可疑模式: ${passedTests}
- **文件**: extension/licensing/simple-test.ts
- **行号**: 212
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 213 行发现可疑模式: ${totalTests - passedTests}
- **文件**: extension/licensing/simple-test.ts
- **行号**: 213
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 214 行发现可疑模式: ${((passedTests / totalTests) * 100).toFixed(1)}
- **文件**: extension/licensing/simple-test.ts
- **行号**: 214
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 229 行发现可疑模式: ${metric.name}
- **文件**: extension/licensing/simple-test.ts
- **行号**: 229
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 229 行发现可疑模式: ${metric.status}
- **文件**: extension/licensing/simple-test.ts
- **行号**: 229
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 229 行发现可疑模式: ${metric.target}
- **文件**: extension/licensing/simple-test.ts
- **行号**: 229
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 229 行发现可疑模式: ${metric.actual}
- **文件**: extension/licensing/simple-test.ts
- **行号**: 229
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 233 行发现可疑模式: ${overallQualityScore.toFixed(1)}
- **文件**: extension/licensing/simple-test.ts
- **行号**: 233
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 21 行发现可疑模式: ');
    totalTests++;
    try {
        const machineId = MachineID.getInstance();
        const id = machineId.machineId;
        const key = machineId.machineSpecificKey;

        console.log(`  机器ID: ${id.substring(0, 16)}...`);
        console.log(`  加密密钥存在: ${key !== BigInt(0)}`);
        
        if (id && id.length > 0 && key !== BigInt(0)) {
            console.log('
- **文件**: extension/licensing/simple-test.ts
- **行号**: 21
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 32 行发现可疑模式: ');
            passedTests++;
        } else {
            console.log('
- **文件**: extension/licensing/simple-test.ts
- **行号**: 32
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 42 行发现可疑模式: ');
    totalTests++;
    try {
        const machineId1 = MachineID.getInstance();
        const machineId2 = MachineID.getInstance();

        const id1 = machineId1.machineId;
        const id2 = machineId2.machineId;
        const key1 = machineId1.machineSpecificKey;
        const key2 = machineId2.machineSpecificKey;

        console.log(`  ID一致性: ${id1 === id2}`);
        console.log(`  密钥一致性: ${key1 === key2}`);

        if (id1 === id2 && key1 === key2) {
            console.log('
- **文件**: extension/licensing/simple-test.ts
- **行号**: 42
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 57 行发现可疑模式: ');
            passedTests++;
        } else {
            console.log('
- **文件**: extension/licensing/simple-test.ts
- **行号**: 57
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 67 行发现可疑模式: ');
    totalTests++;
    try {
        const crypt = new SimpleCrypt();
        const machineId = MachineID.getInstance();
        crypt.setKey(machineId.machineSpecificKey);

        const plaintext = '
- **文件**: extension/licensing/simple-test.ts
- **行号**: 67
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 83 行发现可疑模式: ');
            passedTests++;
        } else {
            console.log('
- **文件**: extension/licensing/simple-test.ts
- **行号**: 83
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 93 行发现可疑模式: ');
    totalTests++;
    try {
        const crypt = new SimpleCrypt();
        const machineId = MachineID.getInstance();
        crypt.setKey(machineId.machineSpecificKey);
        crypt.setIntegrityProtectionMode(ProtectionMode.ProtectionHash);

        const plaintext = '
- **文件**: extension/licensing/simple-test.ts
- **行号**: 93
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 101 行发现可疑模式: ';
        const encrypted = crypt.encrypt(plaintext);
        
        // 尝试篡改加密数据
        const tamperedData = encrypted.substring(0, encrypted.length - 5) + '
- **文件**: extension/licensing/simple-test.ts
- **行号**: 101
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 115 行发现可疑模式: ');
            passedTests++;
        } else {
            console.log('
- **文件**: extension/licensing/simple-test.ts
- **行号**: 115
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 125 行发现可疑模式: ');
    totalTests++;
    try {
        const crypt = new SimpleCrypt();
        const machineId = MachineID.getInstance();
        crypt.setKey(machineId.machineSpecificKey);

        const testData = '
- **文件**: extension/licensing/simple-test.ts
- **行号**: 125
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 132 行发现可疑模式: '.repeat(10);
        const iterations = 1000;

        // 测试加密性能
        const encryptStart = Date.now();
        for (let i = 0; i < iterations; i++) {
            crypt.encrypt(testData);
        }
        const encryptTime = Date.now() - encryptStart;

        // 测试解密性能
        const encrypted = crypt.encrypt(testData);
        const decryptStart = Date.now();
        for (let i = 0; i < iterations; i++) {
            crypt.decrypt(encrypted);
        }
        const decryptTime = Date.now() - decryptStart;

        console.log(`  加密性能: ${iterations}次 ${encryptTime}ms (${(encryptTime/iterations).toFixed(2)}ms/次)`);
        console.log(`  解密性能: ${iterations}次 ${decryptTime}ms (${(decryptTime/iterations).toFixed(2)}ms/次)`);

        // 性能要求：单次操作≤10ms
        const avgEncryptTime = encryptTime / iterations;
        const avgDecryptTime = decryptTime / iterations;

        if (avgEncryptTime <= 10 && avgDecryptTime <= 10) {
            console.log('
- **文件**: extension/licensing/simple-test.ts
- **行号**: 132
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 158 行发现可疑模式: ');
            passedTests++;
        } else {
            console.log('
- **文件**: extension/licensing/simple-test.ts
- **行号**: 158
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 168 行发现可疑模式: ');
    totalTests++;
    try {
        const validKey = '
- **文件**: extension/licensing/simple-test.ts
- **行号**: 168
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/licensing/simple-test.ts 第 199 行发现可疑模式: ');
            passedTests++;
        } else {
            console.log('
- **文件**: extension/licensing/simple-test.ts
- **行号**: 199
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/main.ts 第 90 行发现可疑模式: ${frame.data.length}
- **文件**: extension/main.ts
- **行号**: 90
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/main.ts 第 90 行发现可疑模式: ${frame.sequence}
- **文件**: extension/main.ts
- **行号**: 90
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/main.ts 第 106 行发现可疑模式: ${error.message}
- **文件**: extension/main.ts
- **行号**: 106
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/main.ts 第 107 行发现可疑模式: ${error.message}
- **文件**: extension/main.ts
- **行号**: 107
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/main.ts 第 119 行发现可疑模式: ${message}
- **文件**: extension/main.ts
- **行号**: 119
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/main.ts 第 282 行发现可疑模式: ${portName}
- **文件**: extension/main.ts
- **行号**: 282
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/main.ts 第 285 行发现可疑模式: ${error}
- **文件**: extension/main.ts
- **行号**: 285
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/main.ts 第 300 行发现可疑模式: ${error}
- **文件**: extension/main.ts
- **行号**: 300
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/main.ts 第 359 行发现可疑模式: ${message.type}
- **文件**: extension/main.ts
- **行号**: 359
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/main.ts 第 573 行发现可疑模式: ${error}
- **文件**: extension/main.ts
- **行号**: 573
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/parsing/Checksum.ts 第 73 行发现可疑模式: ${algorithm}
- **文件**: extension/parsing/Checksum.ts
- **行号**: 73
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/parsing/Checksum.ts 第 106 行发现可疑模式: ':
        return 0;
      
      default:
        return 0;
    }
  }

  /**
   * 计算CRC-8校验和
   * @param data 数据
   * @returns CRC-8校验和
   */
  private static calculateCRC8(data: Buffer): Buffer {
    if (!this.crc8Table) {
      this.crc8Table = this.generateCRC8Table();
    }

    let crc = 0x00;
    for (const byte of data) {
      crc = this.crc8Table[(crc ^ byte) & 0xFF];
    }

    return Buffer.from([crc]);
  }

  /**
   * 生成CRC-8查找表
   * @returns CRC-8查找表
   */
  private static generateCRC8Table(): number[] {
    const table = new Array(256);
    const polynomial = 0x07; // CRC-8-ATM polynomial

    for (let i = 0; i < 256; i++) {
      let crc = i;
      for (let j = 0; j < 8; j++) {
        if (crc & 0x80) {
          crc = (crc << 1) ^ polynomial;
        } else {
          crc = crc << 1;
        }
        crc &= 0xFF;
      }
      table[i] = crc;
    }

    return table;
  }

  /**
   * 计算CRC-16校验和
   * @param data 数据
   * @returns CRC-16校验和
   */
  private static calculateCRC16(data: Buffer): Buffer {
    if (!this.crc16Table) {
      this.crc16Table = this.generateCRC16Table();
    }

    let crc = 0x0000;
    for (const byte of data) {
      const tblIdx = ((crc >> 8) ^ byte) & 0xFF;
      crc = ((crc << 8) ^ this.crc16Table[tblIdx]) & 0xFFFF;
    }

    const result = Buffer.alloc(2);
    result.writeUInt16BE(crc, 0);
    return result;
  }

  /**
   * 生成CRC-16查找表
   * @returns CRC-16查找表
   */
  private static generateCRC16Table(): number[] {
    const table = new Array(256);
    const polynomial = 0x1021; // CRC-16-CCITT polynomial

    for (let i = 0; i < 256; i++) {
      let crc = i << 8;
      for (let j = 0; j < 8; j++) {
        if (crc & 0x8000) {
          crc = (crc << 1) ^ polynomial;
        } else {
          crc = crc << 1;
        }
        crc &= 0xFFFF;
      }
      table[i] = crc;
    }

    return table;
  }

  /**
   * 计算CRC-32校验和
   * @param data 数据
   * @returns CRC-32校验和
   */
  private static calculateCRC32(data: Buffer): Buffer {
    if (!this.crc32Table) {
      this.crc32Table = this.generateCRC32Table();
    }

    let crc = 0xFFFFFFFF;
    for (const byte of data) {
      const tblIdx = (crc ^ byte) & 0xFF;
      crc = (crc >>> 8) ^ this.crc32Table[tblIdx];
    }

    crc = crc ^ 0xFFFFFFFF;
    const result = Buffer.alloc(4);
    result.writeUInt32BE(crc >>> 0, 0); // >>> 0 确保无符号
    return result;
  }

  /**
   * 生成CRC-32查找表
   * @returns CRC-32查找表
   */
  private static generateCRC32Table(): number[] {
    const table = new Array(256);
    const polynomial = 0xEDB88320;

    for (let i = 0; i < 256; i++) {
      let crc = i;
      for (let j = 0; j < 8; j++) {
        if (crc & 1) {
          crc = (crc >>> 1) ^ polynomial;
        } else {
          crc = crc >>> 1;
        }
      }
      table[i] = crc >>> 0; // >>> 0 确保无符号
    }

    return table;
  }

  /**
   * 计算MD5哈希
   * @param data 数据
   * @returns MD5哈希
   */
  private static calculateMD5(data: Buffer): Buffer {
    return crypto.createHash('
- **文件**: extension/parsing/Checksum.ts
- **行号**: 106
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/parsing/Checksum.ts 第 270 行发现可疑模式: ').update(data).digest();
  }

  /**
   * 计算XOR校验和
   * @param data 数据
   * @returns XOR校验和
   */
  private static calculateXOR(data: Buffer): Buffer {
    let xor = 0;
    for (const byte of data) {
      xor ^= byte;
    }
    return Buffer.from([xor]);
  }

  /**
   * 计算Fletcher-16校验和
   * @param data 数据
   * @returns Fletcher-16校验和
   */
  private static calculateFletcher16(data: Buffer): Buffer {
    let sum1 = 0;
    let sum2 = 0;

    for (const byte of data) {
      sum1 = (sum1 + byte) % 255;
      sum2 = (sum2 + sum1) % 255;
    }

    const result = Buffer.alloc(2);
    result[0] = sum2;
    result[1] = sum1;
    return result;
  }

  /**
   * 计算Fletcher-32校验和
   * @param data 数据
   * @returns Fletcher-32校验和
   */
  private static calculateFletcher32(data: Buffer): Buffer {
    let sum1 = 0;
    let sum2 = 0;

    // 确保数据长度为偶数，不足时补零
    const paddedData = data.length % 2 === 0 ? data : Buffer.concat([data, Buffer.from([0])]);

    for (let i = 0; i < paddedData.length; i += 2) {
      const word = paddedData.readUInt16BE(i);
      sum1 = (sum1 + word) % 65535;
      sum2 = (sum2 + sum1) % 65535;
    }

    const result = Buffer.alloc(4);
    result.writeUInt16BE(sum2, 0);
    result.writeUInt16BE(sum1, 2);
    return result;
  }

  /**
   * 验证校验和
   * @param algorithm 校验和算法
   * @param data 数据
   * @param expectedChecksum 期望的校验和
   * @returns 校验是否通过
   */
  static verify(algorithm: string, data: Buffer, expectedChecksum: Buffer): boolean {
    try {
      const calculatedChecksum = this.calculate(algorithm, data);
      return calculatedChecksum.equals(expectedChecksum);
    } catch (error) {
      console.error('
- **文件**: extension/parsing/Checksum.ts
- **行号**: 270
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/parsing/DataDecoder.ts 第 35 行发现可疑模式: ${method}
- **文件**: extension/parsing/DataDecoder.ts
- **行号**: 35
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/parsing/DataDecoder.ts 第 129 行发现可疑模式: ${method}
- **文件**: extension/parsing/DataDecoder.ts
- **行号**: 129
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/parsing/DataDecoder.ts 第 64 行发现可疑模式: ' + hexString;
      
      // 转换为Buffer并解码
      const decoded = Buffer.from(paddedHex, '
- **文件**: extension/parsing/DataDecoder.ts
- **行号**: 64
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/parsing/DataDecoder.ts 第 82 行发现可疑模式: ').replace(/[^A-Za-z0-9+/=]/g, '
- **文件**: extension/parsing/DataDecoder.ts
- **行号**: 82
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/parsing/DataDecoder.ts 第 144 行发现可疑模式: ');
    
    // 检查是否为Base64
    if (this.isValidBase64(text)) {
      return DecoderMethod.Base64;
    }
    
    // 检查是否为十六进制
    if (this.isValidHex(text)) {
      return DecoderMethod.Hexadecimal;
    }
    
    // 检查是否为二进制数值序列
    if (this.isValidBinary(text)) {
      return DecoderMethod.Binary;
    }
    
    // 默认为纯文本
    return DecoderMethod.PlainText;
  }

  /**
   * 检查字符串是否为有效的Base64
   */
  private static isValidBase64(str: string): boolean {
    try {
      const cleaned = str.replace(/[^A-Za-z0-9+/=]/g, '
- **文件**: extension/parsing/DataDecoder.ts
- **行号**: 144
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/parsing/DataDecoder.ts 第 170 行发现可疑模式: ');
      return cleaned.length > 0 && 
             cleaned.length % 4 === 0 && 
             /^[A-Za-z0-9+/]+={0,2}$/.test(cleaned);
    } catch {
      return false;
    }
  }

  /**
   * 检查字符串是否为有效的十六进制
   */
  private static isValidHex(str: string): boolean {
    const cleaned = str.replace(/[^0-9A-Fa-f]/g, '
- **文件**: extension/parsing/DataDecoder.ts
- **行号**: 170
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/parsing/DataDecoder.ts 第 183 行发现可疑模式: ');
    return cleaned.length > 0 && 
           cleaned.length >= str.length * 0.8 && // 至少80%为十六进制字符
           /^[0-9A-Fa-f]+$/.test(cleaned);
  }

  /**
   * 检查字符串是否为有效的二进制数值序列
   */
  private static isValidBinary(str: string): boolean {
    const parts = str.split('
- **文件**: extension/parsing/DataDecoder.ts
- **行号**: 183
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/parsing/FrameParser.ts 第 149 行发现可疑模式: ${JSON.stringify(frame)}
- **文件**: extension/parsing/FrameParser.ts
- **行号**: 149
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/parsing/FrameParser.ts 第 169 行发现可疑模式: ${errorMessage}
- **文件**: extension/parsing/FrameParser.ts
- **行号**: 169
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/parsing/FrameParser.ts 第 180 行发现可疑模式: ${errorMessage}
- **文件**: extension/parsing/FrameParser.ts
- **行号**: 180
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/parsing/FrameParser.ts 第 212 行发现可疑模式: ${firstArg}
- **文件**: extension/parsing/FrameParser.ts
- **行号**: 212
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/parsing/FrameParser.ts 第 212 行发现可疑模式: ${secondArg}
- **文件**: extension/parsing/FrameParser.ts
- **行号**: 212
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/parsing/FrameParser.ts 第 180 行发现可疑模式: ', new Error(`脚本加载错误: ${errorMessage}`));
      return false;
    }
  }

  /**
   * 验证parse函数的声明格式
   * @param script 脚本内容
   * @returns 是否有效
   */
  private validateParseFunction(script: string): boolean {
    // 使用正则表达式检查parse函数声明
    const functionRegex = /\bfunction\s+parse\s*\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*,\s*([a-zA-Z_$][a-zA-Z0-9_$]*))?\s*\)/;
    const match = functionRegex.exec(script);
    
    if (!match) {
      this.emit('
- **文件**: extension/parsing/FrameParser.ts
- **行号**: 180
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/parsing/FrameParser.ts 第 212 行发现可疑模式: ')。` +
        `请更新为新格式，只接受帧数据作为参数。`
      ));
      return false;
    }

    return true;
  }

  /**
   * 解析UTF-8文本数据帧
   * @param frame 解码后的UTF-8字符串帧
   * @returns 解析结果
   */
  parse(frame: string): ParseResult {
    const startTime = Date.now();
    
    try {
      if (!this.parseFunction) {
        throw new Error('
- **文件**: extension/parsing/FrameParser.ts
- **行号**: 212
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/parsing/FrameParser.ts 第 436 行发现可疑模式: ':
        return `
/**
 * 自定义数据解析器
 * 根据您的数据格式自定义解析逻辑
 */
function parse(frame) {
    // 在此处添加您的解析逻辑
    // frame 参数包含从设备接收的原始数据
    
    // 示例：处理固定宽度的数据
    const result = [];
    for (let i = 0; i < frame.length; i += 4) {
        result.push(frame.substr(i, 4));
    }
    
    return result;
}`;

      default:
        return FrameParser.DEFAULT_SCRIPT;
    }
  }

  /**
   * 销毁解析器并清理资源
   */
  destroy(): void {
    this.parseFunction = null;
    this.currentScript = '
- **文件**: extension/parsing/FrameParser.ts
- **行号**: 436
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的Command Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/parsing/FrameParser.ts 第 193 行发现可疑模式: exec(
- **文件**: extension/parsing/FrameParser.ts
- **行号**: 193
- **CWE ID**: CWE-78
- **建议**: 避免执行外部命令，使用安全的API替代

### 🔴 潜在的Command Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/parsing/FrameParser.ts 第 141 行发现可疑模式: Function(
- **文件**: extension/parsing/FrameParser.ts
- **行号**: 141
- **CWE ID**: CWE-78
- **建议**: 避免执行外部命令，使用安全的API替代

### 🔴 潜在的Command Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/parsing/FrameParser.ts 第 190 行发现可疑模式: Function(
- **文件**: extension/parsing/FrameParser.ts
- **行号**: 190
- **CWE ID**: CWE-78
- **建议**: 避免执行外部命令，使用安全的API替代

### 🔴 潜在的Command Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/parsing/FrameParser.ts 第 234 行发现可疑模式: Function(
- **文件**: extension/parsing/FrameParser.ts
- **行号**: 234
- **CWE ID**: CWE-78
- **建议**: 避免执行外部命令，使用安全的API替代

### 🔴 潜在的Command Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/parsing/FrameParser.ts 第 271 行发现可疑模式: Function(
- **文件**: extension/parsing/FrameParser.ts
- **行号**: 271
- **CWE ID**: CWE-78
- **建议**: 避免执行外部命令，使用安全的API替代

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/parsing/FrameReader.ts 第 71 行发现可疑模式: ');
  }

  /**
   * 根据当前模式提取帧
   */
  private extractFrames(): void {
    switch (this.config.operationMode) {
      case OperationMode.QuickPlot:
        this.readEndDelimitedFrames();
        break;
      
      case OperationMode.DeviceSendsJSON:
        this.readStartEndDelimitedFrames();
        break;
      
      case OperationMode.ProjectFile:
        switch (this.config.frameDetectionMode) {
          case FrameDetection.EndDelimiterOnly:
            this.readEndDelimitedFrames();
            break;
          
          case FrameDetection.StartDelimiterOnly:
            this.readStartDelimitedFrames();
            break;
          
          case FrameDetection.StartAndEndDelimiter:
            this.readStartEndDelimitedFrames();
            break;
        }
        break;
    }
  }

  /**
   * 解析由已知结束分隔符终止的帧
   * 处理QuickPlot和Project模式，其中帧的结束由特定的字节序列标记
   */
  private readEndDelimitedFrames(): void {
    while (true) {
      let endIndex = -1;
      let delimiter = Buffer.alloc(0);

      // 查找最早的结束序列（QuickPlot模式）
      if (this.config.operationMode === OperationMode.QuickPlot) {
        for (const d of this.quickPlotEndSequences) {
          const index = this.circularBuffer.findPatternKMP(d);
          if (index !== -1 && (endIndex === -1 || index < endIndex)) {
            endIndex = index;
            delimiter = d;
            break;
          }
        }
      } else if (this.config.frameDetectionMode === FrameDetection.EndDelimiterOnly) {
        // 或使用固定分隔符（项目模式）
        delimiter = this.config.finishSequence;
        endIndex = this.circularBuffer.findPatternKMP(delimiter);
      }

      // 未找到帧
      if (endIndex === -1) {
        break;
      }

      // 提取帧数据
      const frame = this.circularBuffer.peek(endIndex);
      const crcPosition = endIndex + delimiter.length;
      const frameEndPos = crcPosition + this.checksumLength;

      // 读取帧
      if (frame.length > 0) {
        const result = this.validateChecksum(frame, crcPosition);
        
        if (result === ValidationStatus.FrameOk) {
          this.enqueueFrame(frame);
          this.circularBuffer.read(frameEndPos);
        } else if (result === ValidationStatus.ChecksumIncomplete) {
          // 数据不完整，等待更多数据
          break;
        } else {
          // 校验和错误，丢弃帧
          this.circularBuffer.read(frameEndPos);
        }
      } else {
        // 无效帧
        this.circularBuffer.read(frameEndPos);
      }
    }
  }

  /**
   * 解析仅由开始序列分隔的帧
   * 假设每个帧都以固定的开始模式开始，并在下一个相同模式的出现之前结束
   */
  private readStartDelimitedFrames(): void {
    while (true) {
      // 在缓冲区中找到第一个开始分隔符
      const startIndex = this.circularBuffer.findPatternKMP(this.config.startSequence);
      if (startIndex === -1) {
        break;
      }

      // 尝试在此之后找到下一个开始分隔符
      const nextStartIndex = this.circularBuffer.findPatternKMP(
        this.config.startSequence, 
        startIndex + this.config.startSequence.length
      );

      // 计算当前帧的开始和结束位置
      let frameEndPos: number;
      const frameStart = startIndex + this.config.startSequence.length;

      // 未找到第二个开始分隔符...可能是流中的最后一帧
      if (nextStartIndex === -1) {
        frameEndPos = this.circularBuffer.getSize();
        if ((frameEndPos - frameStart) < this.checksumLength) {
          break;
        }
      } else {
        // 找到有效的第二个开始分隔符
        frameEndPos = nextStartIndex;
      }

      // 计算帧长度并验证其合理性
      const frameLength = frameEndPos - frameStart;
      if (frameLength <= 0) {
        this.circularBuffer.read(frameEndPos);
        continue;
      }

      // 计算校验和的位置并进行完整性检查
      const crcPosition = frameEndPos - this.checksumLength;
      if (crcPosition < frameStart) {
        this.circularBuffer.read(frameEndPos);
        continue;
      }

      // 构建帧字节数组
      const fullFrame = this.circularBuffer.peek(frameEndPos);
      const frame = fullFrame.subarray(frameStart, frameStart + frameLength - this.checksumLength);

      // 验证帧
      if (frame.length > 0) {
        const result = this.validateChecksum(frame, crcPosition);
        
        if (result === ValidationStatus.FrameOk) {
          this.enqueueFrame(frame);
          this.circularBuffer.read(frameEndPos);
        } else if (result === ValidationStatus.ChecksumIncomplete) {
          // 还没有足够的字节来计算校验和，等待更多数据
          break;
        } else {
          // 无效校验和...丢弃并继续
          this.circularBuffer.read(frameEndPos);
        }
      } else {
        // 空帧或无效数据，丢弃...
        this.circularBuffer.read(frameEndPos);
      }
    }
  }

  /**
   * 使用开始和结束分隔符解析帧
   * 用于JSON和Project模式，其中帧以已知字节序列开始并以另一个结束
   */
  private readStartEndDelimitedFrames(): void {
    while (true) {
      // 定位结束分隔符
      const finishIndex = this.circularBuffer.findPatternKMP(this.config.finishSequence);
      if (finishIndex === -1) {
        break;
      }

      // 定位开始分隔符并确保它在结束之前
      const startIndex = this.circularBuffer.findPatternKMP(this.config.startSequence);
      if (startIndex === -1 || startIndex >= finishIndex) {
        this.circularBuffer.read(finishIndex + this.config.finishSequence.length);
        continue;
      }

      // 确定有效载荷边界
      const frameStart = startIndex + this.config.startSequence.length;
      const frameLength = finishIndex - frameStart;
      if (frameLength <= 0) {
        this.circularBuffer.read(finishIndex + this.config.finishSequence.length);
        continue;
      }

      // 提取帧数据
      const crcPosition = finishIndex + this.config.finishSequence.length;
      const frameEndPos = crcPosition + this.checksumLength;
      const fullFrame = this.circularBuffer.peek(frameStart + frameLength);
      const frame = fullFrame.subarray(frameStart, frameStart + frameLength);

      // 读取帧
      if (frame.length > 0) {
        const result = this.validateChecksum(frame, crcPosition);
        
        if (result === ValidationStatus.FrameOk) {
          this.enqueueFrame(frame);
          this.circularBuffer.read(frameEndPos);
        } else if (result === ValidationStatus.ChecksumIncomplete) {
          // 数据不完整，等待更多数据
          break;
        } else {
          // 校验和错误
          this.circularBuffer.read(frameEndPos);
        }
      } else {
        // 无效帧
        this.circularBuffer.read(frameEndPos);
      }
    }
  }

  /**
   * 验证帧的校验和
   * @param frame 提取的帧有效载荷（不包括校验和字节）
   * @param crcPosition 缓冲区中校验和开始的字节偏移量
   * @returns 验证状态
   */
  private validateChecksum(frame: Buffer, crcPosition: number): ValidationStatus {
    // 如果校验和为空则提前停止
    if (this.checksumLength === 0) {
      return ValidationStatus.FrameOk;
    }

    // 验证我们可以读取校验和
    const buffer = this.circularBuffer.peek(this.circularBuffer.getSize());
    if (buffer.length < crcPosition + this.checksumLength) {
      return ValidationStatus.ChecksumIncomplete;
    }

    try {
      // 比较计算的与接收的校验和
      const calculated = ChecksumCalculator.calculate(this.config.checksumAlgorithm, frame);
      const received = buffer.subarray(crcPosition, crcPosition + this.checksumLength);
      
      if (calculated.equals(received)) {
        return ValidationStatus.FrameOk;
      }

      // 记录校验和不匹配
      console.warn('
- **文件**: extension/parsing/FrameReader.ts
- **行号**: 71
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/parsing/FrameReader.ts 第 324 行发现可疑模式: ', error);
      return ValidationStatus.ChecksumError;
    }
  }

  /**
   * 将帧加入队列
   * @param data 帧数据
   */
  private enqueueFrame(data: Buffer): void {
    const frame: RawFrame = {
      data: Buffer.from(data), // 创建副本以避免引用问题
      timestamp: Date.now(),
      sequence: ++this.sequenceNumber,
      checksumValid: true
    };

    this.frameQueue.push(frame);
    
    // 限制队列大小以防止内存泄漏
    if (this.frameQueue.length > 4096) {
      this.frameQueue.shift();
    }
  }

  /**
   * 从队列中获取下一个可用帧
   * @returns 下一个帧，如果没有可用帧则返回null
   */
  dequeueFrame(): RawFrame | null {
    return this.frameQueue.shift() || null;
  }

  /**
   * 获取队列中等待处理的帧数量
   * @returns 队列长度
   */
  getQueueLength(): number {
    return this.frameQueue.length;
  }

  /**
   * 清空帧队列
   */
  clearQueue(): void {
    this.frameQueue = [];
  }

  /**
   * 设置校验和算法
   * @param algorithm 新的校验和算法
   */
  setChecksumAlgorithm(algorithm: string): void {
    this.config.checksumAlgorithm = algorithm;
    this.updateChecksumLength();
  }

  /**
   * 设置开始序列
   * @param sequence 新的开始序列
   */
  setStartSequence(sequence: Buffer): void {
    this.config.startSequence = Buffer.from(sequence);
  }

  /**
   * 设置结束序列
   * @param sequence 新的结束序列
   */
  setFinishSequence(sequence: Buffer): void {
    this.config.finishSequence = Buffer.from(sequence);
  }

  /**
   * 设置操作模式
   * @param mode 新的操作模式
   */
  setOperationMode(mode: OperationMode): void {
    this.config.operationMode = mode;
    
    if (mode !== OperationMode.ProjectFile) {
      this.checksumLength = 0;
      this.config.checksumAlgorithm = '
- **文件**: extension/parsing/FrameReader.ts
- **行号**: 324
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/ContributionRegistry.ts 第 91 行发现可疑模式: ${contributionId}
- **文件**: extension/plugins/ContributionRegistry.ts
- **行号**: 91
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/ContributionRegistry.ts 第 91 行发现可疑模式: ${existingOwner}
- **文件**: extension/plugins/ContributionRegistry.ts
- **行号**: 91
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/ContributionRegistry.ts 第 145 行发现可疑模式: ${extensionPoint}
- **文件**: extension/plugins/ContributionRegistry.ts
- **行号**: 145
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/ContributionRegistry.ts 第 156 行发现可疑模式: ${contributionId}
- **文件**: extension/plugins/ContributionRegistry.ts
- **行号**: 156
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/ContributionRegistry.ts 第 156 行发现可疑模式: ${extensionPoint}
- **文件**: extension/plugins/ContributionRegistry.ts
- **行号**: 156
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/ContributionRegistry.ts 第 156 行发现可疑模式: ${pluginId}
- **文件**: extension/plugins/ContributionRegistry.ts
- **行号**: 156
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/ContributionRegistry.ts 第 166 行发现可疑模式: ${contributionId}
- **文件**: extension/plugins/ContributionRegistry.ts
- **行号**: 166
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/ContributionRegistry.ts 第 191 行发现可疑模式: ${contributionId}
- **文件**: extension/plugins/ContributionRegistry.ts
- **行号**: 191
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/ContributionRegistry.ts 第 191 行发现可疑模式: ${pluginId}
- **文件**: extension/plugins/ContributionRegistry.ts
- **行号**: 191
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/ContributionRegistry.ts 第 369 行发现可疑模式: ${event}
- **文件**: extension/plugins/ContributionRegistry.ts
- **行号**: 369
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginContext.ts 第 57 行发现可疑模式: ${pluginId}
- **文件**: extension/plugins/PluginContext.ts
- **行号**: 57
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginContext.ts 第 62 行发现可疑模式: ${timestamp}
- **文件**: extension/plugins/PluginContext.ts
- **行号**: 62
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginContext.ts 第 62 行发现可疑模式: ${message}
- **文件**: extension/plugins/PluginContext.ts
- **行号**: 62
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginContext.ts 第 68 行发现可疑模式: ${JSON.stringify(args, null, 2)}
- **文件**: extension/plugins/PluginContext.ts
- **行号**: 68
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginContext.ts 第 74 行发现可疑模式: ${timestamp}
- **文件**: extension/plugins/PluginContext.ts
- **行号**: 74
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginContext.ts 第 74 行发现可疑模式: ${message}
- **文件**: extension/plugins/PluginContext.ts
- **行号**: 74
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginContext.ts 第 80 行发现可疑模式: ${JSON.stringify(args, null, 2)}
- **文件**: extension/plugins/PluginContext.ts
- **行号**: 80
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginContext.ts 第 86 行发现可疑模式: ${timestamp}
- **文件**: extension/plugins/PluginContext.ts
- **行号**: 86
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginContext.ts 第 86 行发现可疑模式: ${message}
- **文件**: extension/plugins/PluginContext.ts
- **行号**: 86
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginContext.ts 第 92 行发现可疑模式: ${JSON.stringify(args, null, 2)}
- **文件**: extension/plugins/PluginContext.ts
- **行号**: 92
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginContext.ts 第 98 行发现可疑模式: ${timestamp}
- **文件**: extension/plugins/PluginContext.ts
- **行号**: 98
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginContext.ts 第 98 行发现可疑模式: ${message}
- **文件**: extension/plugins/PluginContext.ts
- **行号**: 98
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginContext.ts 第 104 行发现可疑模式: ${JSON.stringify(args, null, 2)}
- **文件**: extension/plugins/PluginContext.ts
- **行号**: 104
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginContext.ts 第 109 行发现可疑模式: ${message}
- **文件**: extension/plugins/PluginContext.ts
- **行号**: 109
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginContext.ts 第 125 行发现可疑模式: ${pluginId}
- **文件**: extension/plugins/PluginContext.ts
- **行号**: 125
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginContext.ts 第 208 行发现可疑模式: ${driver.constructor.name}
- **文件**: extension/plugins/PluginContext.ts
- **行号**: 208
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginContext.ts 第 210 行发现可疑模式: ${(error as Error).message}
- **文件**: extension/plugins/PluginContext.ts
- **行号**: 210
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginContext.ts 第 227 行发现可疑模式: ${(error as Error).message}
- **文件**: extension/plugins/PluginContext.ts
- **行号**: 227
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginContext.ts 第 237 行发现可疑模式: ${transformer.name}
- **文件**: extension/plugins/PluginContext.ts
- **行号**: 237
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginContext.ts 第 239 行发现可疑模式: ${(error as Error).message}
- **文件**: extension/plugins/PluginContext.ts
- **行号**: 239
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginContext.ts 第 253 行发现可疑模式: ${widget.name}
- **文件**: extension/plugins/PluginContext.ts
- **行号**: 253
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginContext.ts 第 255 行发现可疑模式: ${(error as Error).message}
- **文件**: extension/plugins/PluginContext.ts
- **行号**: 255
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginContext.ts 第 273 行发现可疑模式: ${type}
- **文件**: extension/plugins/PluginContext.ts
- **行号**: 273
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginContext.ts 第 273 行发现可疑模式: ${message}
- **文件**: extension/plugins/PluginContext.ts
- **行号**: 273
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginContext.ts 第 288 行发现可疑模式: ${(error as Error).message}
- **文件**: extension/plugins/PluginContext.ts
- **行号**: 288
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginContext.ts 第 300 行发现可疑模式: ${(error as Error).message}
- **文件**: extension/plugins/PluginContext.ts
- **行号**: 300
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginContext.ts 第 323 行发现可疑模式: ${manifest.id}
- **文件**: extension/plugins/PluginContext.ts
- **行号**: 323
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginContext.ts 第 323 行发现可疑模式: ${manifest.version}
- **文件**: extension/plugins/PluginContext.ts
- **行号**: 323
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginContext.ts 第 339 行发现可疑模式: ${manifest.id}
- **文件**: extension/plugins/PluginContext.ts
- **行号**: 339
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginContext.ts 第 339 行发现可疑模式: ${manifest.version}
- **文件**: extension/plugins/PluginContext.ts
- **行号**: 339
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginContext.ts 第 444 行发现可疑模式: ${restrictedAPI}
- **文件**: extension/plugins/PluginContext.ts
- **行号**: 444
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginContext.ts 第 108 行发现可疑模式: ')) {
      vscode.window.showErrorMessage(`Plugin Error: ${message}`);
    }
  }
}

/**
 * Plugin Storage Implementation
 */
class PluginStorageImpl implements PluginStorage {
  private readonly pluginId: string;
  private readonly extensionContext: vscode.ExtensionContext;
  private readonly storagePrefix: string;
  
  constructor(pluginId: string, extensionContext: vscode.ExtensionContext) {
    this.pluginId = pluginId;
    this.extensionContext = extensionContext;
    this.storagePrefix = `plugin.${pluginId}.`;
  }
  
  get<T>(key: string, defaultValue?: T): T | undefined {
    const fullKey = this.storagePrefix + key;
    const value = this.extensionContext.globalState.get<T>(fullKey);
    
    if (value === undefined && defaultValue !== undefined) {
      return defaultValue;
    }
    
    return value;
  }
  
  async set<T>(key: string, value: T): Promise<void> {
    const fullKey = this.storagePrefix + key;
    await this.extensionContext.globalState.update(fullKey, value);
  }
  
  async delete(key: string): Promise<void> {
    const fullKey = this.storagePrefix + key;
    await this.extensionContext.globalState.update(fullKey, undefined);
  }
  
  async clear(): Promise<void> {
    const keys = this.extensionContext.globalState.keys();
    
    for (const key of keys) {
      if (key.startsWith(this.storagePrefix)) {
        await this.extensionContext.globalState.update(key, undefined);
      }
    }
  }
  
  /**
   * Get all keys for this plugin
   */
  getKeys(): string[] {
    const keys = this.extensionContext.globalState.keys();
    return keys
      .filter(key => key.startsWith(this.storagePrefix))
      .map(key => key.substring(this.storagePrefix.length));
  }
  
  /**
   * Get all data for this plugin
   */
  getAll(): Record<string, any> {
    const keys = this.getKeys();
    const data: Record<string, any> = {};
    
    for (const key of keys) {
      data[key] = this.get(key);
    }
    
    return data;
  }
}

/**
 * Plugin API Implementation
 */
class PluginAPIImpl implements PluginAPI {
  private readonly logger: PluginLogger;
  
  constructor(logger: PluginLogger) {
    this.logger = logger;
  }
  
  get io() {
    return {
      getManager: () => {
        // IOManager is not a singleton, return a new instance
        return new IOManager();
      },
      
      registerDriver: (driver: HALDriver) => {
        try {
          // Register the driver with the IO manager
          const manager = new IOManager();
          // Note: This would need to be implemented in the actual IOManager
          // manager.registerDriver(driver);
          
          this.logger.info(`Registered driver: ${driver.constructor.name}`);
        } catch (error) {
          this.logger.error(`Failed to register driver: ${(error as Error).message}`);
          throw error;
        }
      }
    };
  }
  
  get parsing() {
    return {
      createParser: (script: string) => {
        try {
          const parser = new FrameParser();
          parser.loadScript(script);
          
          this.logger.info('
- **文件**: extension/plugins/PluginContext.ts
- **行号**: 108
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginLoader.ts 第 43 行发现可疑模式: ${manifestPath}
- **文件**: extension/plugins/PluginLoader.ts
- **行号**: 43
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginLoader.ts 第 43 行发现可疑模式: ${(error as Error).message}
- **文件**: extension/plugins/PluginLoader.ts
- **行号**: 43
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginLoader.ts 第 113 行发现可疑模式: ${errors.join('\\n')}
- **文件**: extension/plugins/PluginLoader.ts
- **行号**: 113
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginLoader.ts 第 121 行发现可疑模式: ${manifest.id}
- **文件**: extension/plugins/PluginLoader.ts
- **行号**: 121
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginLoader.ts 第 121 行发现可疑模式: ${manifest.version}
- **文件**: extension/plugins/PluginLoader.ts
- **行号**: 121
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginLoader.ts 第 176 行发现可疑模式: ${manifest.id}
- **文件**: extension/plugins/PluginLoader.ts
- **行号**: 176
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginLoader.ts 第 176 行发现可疑模式: ${(error as Error).message}
- **文件**: extension/plugins/PluginLoader.ts
- **行号**: 176
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginLoader.ts 第 209 行发现可疑模式: ${errors.join('\\n')}
- **文件**: extension/plugins/PluginLoader.ts
- **行号**: 209
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginLoader.ts 第 224 行发现可疑模式: ${index}
- **文件**: extension/plugins/PluginLoader.ts
- **行号**: 224
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginLoader.ts 第 227 行发现可疑模式: ${index}
- **文件**: extension/plugins/PluginLoader.ts
- **行号**: 227
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginLoader.ts 第 230 行发现可疑模式: ${index}
- **文件**: extension/plugins/PluginLoader.ts
- **行号**: 230
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginLoader.ts 第 243 行发现可疑模式: ${index}
- **文件**: extension/plugins/PluginLoader.ts
- **行号**: 243
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginLoader.ts 第 246 行发现可疑模式: ${index}
- **文件**: extension/plugins/PluginLoader.ts
- **行号**: 246
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginLoader.ts 第 249 行发现可疑模式: ${index}
- **文件**: extension/plugins/PluginLoader.ts
- **行号**: 249
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginLoader.ts 第 262 行发现可疑模式: ${index}
- **文件**: extension/plugins/PluginLoader.ts
- **行号**: 262
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginLoader.ts 第 265 行发现可疑模式: ${index}
- **文件**: extension/plugins/PluginLoader.ts
- **行号**: 265
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginLoader.ts 第 278 行发现可疑模式: ${index}
- **文件**: extension/plugins/PluginLoader.ts
- **行号**: 278
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginLoader.ts 第 281 行发现可疑模式: ${index}
- **文件**: extension/plugins/PluginLoader.ts
- **行号**: 281
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginLoader.ts 第 284 行发现可疑模式: ${index}
- **文件**: extension/plugins/PluginLoader.ts
- **行号**: 284
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginLoader.ts 第 299 行发现可疑模式: ${depName}
- **文件**: extension/plugins/PluginLoader.ts
- **行号**: 299
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginLoader.ts 第 299 行发现可疑模式: ${depVersion}
- **文件**: extension/plugins/PluginLoader.ts
- **行号**: 299
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginLoader.ts 第 284 行发现可疑模式: " field`);
          }
        });
      }
    }
    
    // Add validation for other contribution types...
  }
  
  /**
   * Validate dependencies
   */
  private validateDependencies(dependencies: Record<string, string>, errors: string[]): void {
    for (const [depName, depVersion] of Object.entries(dependencies)) {
      if (!this.isValidSemanticVersion(depVersion)) {
        errors.push(`Dependency ${depName} has invalid version: ${depVersion}`);
      }
    }
  }
  
  /**
   * Check if version follows semantic versioning
   */
  private isValidSemanticVersion(version: string): boolean {
    const semverRegex = /^\d+\.\d+\.\d+(?:-[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*)?(?:\+[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*)?$/;
    return semverRegex.test(version);
  }
  
  /**
   * Check if plugin ID is valid
   */
  private isValidPluginId(pluginId: string): boolean {
    const idRegex = /^[a-zA-Z0-9.-]+$/;
    return idRegex.test(pluginId) && pluginId.length > 0 && pluginId.length <= 100;
  }
  
  /**
   * Clear caches
   */
  public clearCaches(): void {
    this.manifestCache.clear();
    this.moduleCache.clear();
  }
  
  /**
   * Get manifest schema for validation
   */
  public getManifestSchema(): JSONSchema {
    return {
      type: '
- **文件**: extension/plugins/PluginLoader.ts
- **行号**: 284
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginLoader.ts 第 338 行发现可疑模式: '^[a-zA-Z0-9.-]+$'
- **文件**: extension/plugins/PluginLoader.ts
- **行号**: 338
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginLoader.ts 第 348 行发现可疑模式: '^\\d+\\.\\d+\\.\\d+(?:-[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*)?(?:\\+[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*)?$'
- **文件**: extension/plugins/PluginLoader.ts
- **行号**: 348
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginManager.ts 第 89 行发现可疑模式: ${this.loadedPlugins.size}
- **文件**: extension/plugins/PluginManager.ts
- **行号**: 89
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginManager.ts 第 98 行发现可疑模式: ${manifestPath}
- **文件**: extension/plugins/PluginManager.ts
- **行号**: 98
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginManager.ts 第 106 行发现可疑模式: ${manifest.id}
- **文件**: extension/plugins/PluginManager.ts
- **行号**: 106
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginManager.ts 第 137 行发现可疑模式: ${manifest.name}
- **文件**: extension/plugins/PluginManager.ts
- **行号**: 137
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginManager.ts 第 137 行发现可疑模式: ${manifest.id}
- **文件**: extension/plugins/PluginManager.ts
- **行号**: 137
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginManager.ts 第 141 行发现可疑模式: ${manifestPath}
- **文件**: extension/plugins/PluginManager.ts
- **行号**: 141
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginManager.ts 第 161 行发现可疑模式: ${pluginId}
- **文件**: extension/plugins/PluginManager.ts
- **行号**: 161
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginManager.ts 第 173 行发现可疑模式: ${instance.manifest.name}
- **文件**: extension/plugins/PluginManager.ts
- **行号**: 173
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginManager.ts 第 196 行发现可疑模式: ${instance.manifest.name}
- **文件**: extension/plugins/PluginManager.ts
- **行号**: 196
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginManager.ts 第 204 行发现可疑模式: ${pluginId}
- **文件**: extension/plugins/PluginManager.ts
- **行号**: 204
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginManager.ts 第 214 行发现可疑模式: ${(error as Error).message}
- **文件**: extension/plugins/PluginManager.ts
- **行号**: 214
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginManager.ts 第 229 行发现可疑模式: ${instance.manifest.name}
- **文件**: extension/plugins/PluginManager.ts
- **行号**: 229
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginManager.ts 第 259 行发现可疑模式: ${instance.manifest.name}
- **文件**: extension/plugins/PluginManager.ts
- **行号**: 259
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginManager.ts 第 263 行发现可疑模式: ${pluginId}
- **文件**: extension/plugins/PluginManager.ts
- **行号**: 263
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginManager.ts 第 301 行发现可疑模式: ${instance.manifest.name}
- **文件**: extension/plugins/PluginManager.ts
- **行号**: 301
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginManager.ts 第 305 行发现可疑模式: ${pluginId}
- **文件**: extension/plugins/PluginManager.ts
- **行号**: 305
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginManager.ts 第 611 行发现可疑模式: ${pluginDir}
- **文件**: extension/plugins/PluginManager.ts
- **行号**: 611
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginManager.ts 第 616 行发现可疑模式: ${directory}
- **文件**: extension/plugins/PluginManager.ts
- **行号**: 616
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginManager.ts 第 624 行发现可疑模式: ${data.pluginId}
- **文件**: extension/plugins/PluginManager.ts
- **行号**: 624
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginManager.ts 第 628 行发现可疑模式: ${data.pluginId}
- **文件**: extension/plugins/PluginManager.ts
- **行号**: 628
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginManager.ts 第 628 行发现可疑模式: ${data.error?.message}
- **文件**: extension/plugins/PluginManager.ts
- **行号**: 628
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的Command Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/index.ts 第 61 行发现可疑模式: System(
- **文件**: extension/plugins/index.ts
- **行号**: 61
- **CWE ID**: CWE-78
- **建议**: 避免执行外部命令，使用安全的API替代

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/project/ProjectManager.ts 第 174 行发现可疑模式: ${validation.errors.join(', ')}
- **文件**: extension/project/ProjectManager.ts
- **行号**: 174
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/project/ProjectManager.ts 第 189 行发现可疑模式: ${this.jsonFileName}
- **文件**: extension/project/ProjectManager.ts
- **行号**: 189
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/project/ProjectManager.ts 第 194 行发现可疑模式: ${message}
- **文件**: extension/project/ProjectManager.ts
- **行号**: 194
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/project/ProjectManager.ts 第 217 行发现可疑模式: ${this._title}
- **文件**: extension/project/ProjectManager.ts
- **行号**: 217
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/project/ProjectManager.ts 第 246 行发现可疑模式: ${this.jsonFileName}
- **文件**: extension/project/ProjectManager.ts
- **行号**: 246
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/project/ProjectManager.ts 第 251 行发现可疑模式: ${message}
- **文件**: extension/project/ProjectManager.ts
- **行号**: 251
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/project/ProjectManager.ts 第 265 行发现可疑模式: ${this._title}
- **文件**: extension/project/ProjectManager.ts
- **行号**: 265
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/project/ProjectManager.ts 第 307 行发现可疑模式: ${this._currentProject.groups.length + 1}
- **文件**: extension/project/ProjectManager.ts
- **行号**: 307
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/project/ProjectManager.ts 第 341 行发现可疑模式: ${group.datasets.length + 1}
- **文件**: extension/project/ProjectManager.ts
- **行号**: 341
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/project/ProjectManager.ts 第 96 行发现可疑模式: ';
  }

  /**
   * 获取当前项目配置 - 对应groups()等访问器
   */
  public get currentProject(): ProjectConfig | null {
    return this._currentProject;
  }

  /**
   * 获取项目组群数量 - 对应groupCount()
   */
  public get groupCount(): number {
    return this._currentProject?.groups.length || 0;
  }

  /**
   * 获取数据集总数 - 对应datasetCount()
   */
  public get datasetCount(): number {
    if (!this._currentProject) return 0;
    
    return this._currentProject.groups.reduce((total, group) => {
      return total + group.datasets.length;
    }, 0);
  }

  // ================== 项目文件操作 ==================
  // 对应ProjectModel的文件操作方法

  /**
   * 创建新项目 - 对应newJsonFile()
   */
  public async createNewProject(): Promise<void> {
    this._currentProject = this.createDefaultProject();
    this._filePath = '
- **文件**: extension/project/ProjectManager.ts
- **行号**: 96
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/project/ProjectManager.ts 第 277 行发现可疑模式: ':
      default:
        return false;
    }
  }

  // ================== 项目编辑操作 ==================
  // 对应ProjectModel的编辑方法

  /**
   * 设置项目标题
   */
  public setTitle(title: string): void {
    if (this._title !== title) {
      this._title = title;
      if (this._currentProject) {
        this._currentProject.title = title;
      }
      this.setModified(true);
      this.emit(ProjectManager.EVENTS.TITLE_CHANGED, title);
    }
  }

  /**
   * 添加组群 - 对应addGroup()
   */
  public addGroup(title: string, widget: string): boolean {
    if (!this._currentProject) return false;

    const newGroup: Group = {
      title: title || `Group ${this._currentProject.groups.length + 1}`,
      widget: widget || '
- **文件**: extension/project/ProjectManager.ts
- **行号**: 277
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/project/ProjectManager.ts 第 308 行发现可疑模式: ',
      datasets: []
    };

    this._currentProject.groups.push(newGroup);
    this.setModified(true);
    
    return true;
  }

  /**
   * 删除组群 - 对应deleteCurrentGroup()
   */
  public deleteGroup(groupIndex: number): boolean {
    if (!this._currentProject || groupIndex < 0 || groupIndex >= this._currentProject.groups.length) {
      return false;
    }

    this._currentProject.groups.splice(groupIndex, 1);
    this.setModified(true);
    return true;
  }

  /**
   * 添加数据集 - 对应addDataset()
   */
  public addDataset(groupIndex: number, dataset: Partial<Dataset>): boolean {
    if (!this._currentProject || groupIndex < 0 || groupIndex >= this._currentProject.groups.length) {
      return false;
    }

    const group = this._currentProject.groups[groupIndex];
    const newDataset: Dataset = {
      title: dataset.title || `Dataset ${group.datasets.length + 1}`,
      units: dataset.units || '
- **文件**: extension/project/ProjectManager.ts
- **行号**: 308
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/project/ProjectSerializer.ts 第 233 行发现可疑模式: ${error}
- **文件**: extension/project/ProjectSerializer.ts
- **行号**: 233
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/project/ProjectValidator.ts 第 41 行发现可疑模式: ${err.instancePath || 'root'}
- **文件**: extension/project/ProjectValidator.ts
- **行号**: 41
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/project/ProjectValidator.ts 第 41 行发现可疑模式: ${err.message}
- **文件**: extension/project/ProjectValidator.ts
- **行号**: 41
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/project/ProjectValidator.ts 第 78 行发现可疑模式: ${group.widget}
- **文件**: extension/project/ProjectValidator.ts
- **行号**: 78
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/project/ProjectValidator.ts 第 87 行发现可疑模式: ${i + 1}
- **文件**: extension/project/ProjectValidator.ts
- **行号**: 87
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/project/ProjectValidator.ts 第 87 行发现可疑模式: ${err}
- **文件**: extension/project/ProjectValidator.ts
- **行号**: 87
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/project/ProjectValidator.ts 第 164 行发现可疑模式: ${dataset.widget}
- **文件**: extension/project/ProjectValidator.ts
- **行号**: 164
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/project/ProjectValidator.ts 第 231 行发现可疑模式: ${syntaxError}
- **文件**: extension/project/ProjectValidator.ts
- **行号**: 231
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/project/ProjectValidator.ts 第 251 行发现可疑模式: ${duplicateIndices.join(', ')}
- **文件**: extension/project/ProjectValidator.ts
- **行号**: 251
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/project/ProjectValidator.ts 第 262 行发现可疑模式: ${groupIndex + 1}
- **文件**: extension/project/ProjectValidator.ts
- **行号**: 262
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/project/ProjectValidator.ts 第 262 行发现可疑模式: ${group.title}
- **文件**: extension/project/ProjectValidator.ts
- **行号**: 262
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/project/ProjectValidator.ts 第 262 行发现可疑模式: ${err}
- **文件**: extension/project/ProjectValidator.ts
- **行号**: 262
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/project/ProjectValidator.ts 第 275 行发现可疑模式: ${actionIndex + 1}
- **文件**: extension/project/ProjectValidator.ts
- **行号**: 275
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/project/ProjectValidator.ts 第 275 行发现可疑模式: ${action.title}
- **文件**: extension/project/ProjectValidator.ts
- **行号**: 275
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/project/ProjectValidator.ts 第 275 行发现可疑模式: ${err}
- **文件**: extension/project/ProjectValidator.ts
- **行号**: 275
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/project/ProjectValidator.ts 第 73 行发现可疑模式: '
    ];
    
    if (group.widget && !validWidgets.includes(group.widget)) {
      valid = false;
      errors.push(`Invalid group widget: ${group.widget}`);
    }

    // 数据集验证
    for (let i = 0; i < group.datasets.length; i++) {
      const datasetValidation = this.validateDataset(group.datasets[i]);
      if (!datasetValidation.valid) {
        valid = false;
        errors.push(...datasetValidation.errors.map(err => 
          `Dataset ${i + 1}: ${err}`
        ));
      }
    }

    // 特殊组件的数据集数量验证
    if (group.widget === '
- **文件**: extension/project/ProjectValidator.ts
- **行号**: 73
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/project/ProjectValidator.ts 第 251 行发现可疑模式: ')}`);
    }

    // 组群和数据集验证
    for (let groupIndex = 0; groupIndex < project.groups.length; groupIndex++) {
      const group = project.groups[groupIndex];
      const groupValidation = this.validateGroup(group);
      
      if (!groupValidation.valid) {
        valid = false;
        errors.push(...groupValidation.errors.map(err => 
          `Group ${groupIndex + 1} (${group.title}): ${err}`
        ));
      }
    }

    // 动作验证
    for (let actionIndex = 0; actionIndex < project.actions.length; actionIndex++) {
      const action = project.actions[actionIndex];
      const actionValidation = this.validateAction(action);
      
      if (!actionValidation.valid) {
        valid = false;
        errors.push(...actionValidation.errors.map(err => 
          `Action ${actionIndex + 1} (${action.title}): ${err}`
        ));
      }
    }

    return { valid, errors };
  }

  /**
   * 创建项目JSON Schema
   */
  private createProjectSchema(): JSONSchemaType<ProjectConfig> {
    return {
      type: '
- **文件**: extension/project/ProjectValidator.ts
- **行号**: 251
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的Command Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/project/ProjectValidator.ts 第 228 行发现可疑模式: Function(
- **文件**: extension/project/ProjectValidator.ts
- **行号**: 228
- **CWE ID**: CWE-78
- **建议**: 避免执行外部命令，使用安全的API替代

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/test-licensing.ts 第 49 行发现可疑模式: ${message}
- **文件**: extension/test-licensing.ts
- **行号**: 49
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/test-licensing.ts 第 53 行发现可疑模式: ${message}
- **文件**: extension/test-licensing.ts
- **行号**: 53
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/test-licensing.ts 第 57 行发现可疑模式: ${message}
- **文件**: extension/test-licensing.ts
- **行号**: 57
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/test-licensing.ts 第 61 行发现可疑模式: ${options.prompt || 'Input requested'}
- **文件**: extension/test-licensing.ts
- **行号**: 61
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/test-licensing.ts 第 65 行发现可疑模式: ${options?.title || 'Quick pick'}
- **文件**: extension/test-licensing.ts
- **行号**: 65
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/test-licensing.ts 第 65 行发现可疑模式: ${items.length}
- **文件**: extension/test-licensing.ts
- **行号**: 65
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/test-licensing.ts 第 72 行发现可疑模式: ${key}
- **文件**: extension/test-licensing.ts
- **行号**: 72
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/test-licensing.ts 第 76 行发现可疑模式: ${key}
- **文件**: extension/test-licensing.ts
- **行号**: 76
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/test-licensing.ts 第 76 行发现可疑模式: ${value}
- **文件**: extension/test-licensing.ts
- **行号**: 76
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/test-licensing.ts 第 86 行发现可疑模式: ${command}
- **文件**: extension/test-licensing.ts
- **行号**: 86
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/test-licensing.ts 第 90 行发现可疑模式: ${command}
- **文件**: extension/test-licensing.ts
- **行号**: 90
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/test-licensing.ts 第 96 行发现可疑模式: ${uri.toString()}
- **文件**: extension/test-licensing.ts
- **行号**: 96
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/test-licensing.ts 第 172 行发现可疑模式: ${totalTests}
- **文件**: extension/test-licensing.ts
- **行号**: 172
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/test-licensing.ts 第 173 行发现可疑模式: ${totalPassed}
- **文件**: extension/test-licensing.ts
- **行号**: 173
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/test-licensing.ts 第 174 行发现可疑模式: ${totalTests - totalPassed}
- **文件**: extension/test-licensing.ts
- **行号**: 174
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/test-licensing.ts 第 175 行发现可疑模式: ${successRate.toFixed(1)}
- **文件**: extension/test-licensing.ts
- **行号**: 175
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/test-licensing.ts 第 156 行发现可疑模式: ');
        let totalTests = 0;
        let totalPassed = 0;
        let overallSuccess = true;

        for (const suite of results) {
            totalTests += suite.totalTests;
            totalPassed += suite.passedTests;
            
            if (suite.failedTests > 0) {
                overallSuccess = false;
            }
        }

        const successRate = (totalPassed / totalTests) * 100;
        
        console.log(`总测试: ${totalTests}`);
        console.log(`通过: ${totalPassed}`);
        console.log(`失败: ${totalTests - totalPassed}`);
        console.log(`成功率: ${successRate.toFixed(1)}%`);
        
        if (overallSuccess) {
            console.log('
- **文件**: extension/test-licensing.ts
- **行号**: 156
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的Command Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/test-licensing.ts 第 131 行发现可疑模式: function(
- **文件**: extension/test-licensing.ts
- **行号**: 131
- **CWE ID**: CWE-78
- **建议**: 避免执行外部命令，使用安全的API替代

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 471 行发现可疑模式: ${webview.cspSource}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 471
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 472 行发现可疑模式: ${nonce}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 472
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 473 行发现可疑模式: ${webview.cspSource}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 473
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 474 行发现可疑模式: ${styleUri}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 474
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 485 行发现可疑模式: ${nonce}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 485
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 485 行发现可疑模式: ${scriptUri}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 485
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 686 行发现可疑模式: ${project.title}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 686
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 720 行发现可疑模式: ${this.projectManager.title}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 720
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 744 行发现可疑模式: ${path.basename(targetPath)}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 744
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 770 行发现可疑模式: ${Date.now()}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 770
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 799 行发现可疑模式: ${format.type.toUpperCase()}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 799
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 823 行发现可疑模式: ${config.formats.length}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 823
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 866 行发现可疑模式: ${this.projectManager.title}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 866
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 866 行发现可疑模式: ${format.type}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 866
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 887 行发现可疑模式: ${format.type}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 887
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 904 行发现可疑模式: ${escapeXml(project.title)}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 904
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 905 行发现可疑模式: ${project.decoder}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 905
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 906 行发现可疑模式: ${project.frameDetection}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 906
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 907 行发现可疑模式: ${escapeXml(project.frameStart)}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 907
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 908 行发现可疑模式: ${escapeXml(project.frameEnd)}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 908
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 913 行发现可疑模式: ${escapeXml(group.title)}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 913
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 914 行发现可疑模式: ${escapeXml(group.widget)}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 914
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 919 行发现可疑模式: ${escapeXml(dataset.title)}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 919
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 920 行发现可疑模式: ${escapeXml(dataset.units)}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 920
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 921 行发现可疑模式: ${escapeXml(dataset.widget)}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 921
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 922 行发现可疑模式: ${dataset.index}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 922
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 923 行发现可疑模式: ${dataset.graph}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 923
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 924 行发现可疑模式: ${dataset.fft}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 924
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 925 行发现可疑模式: ${dataset.led}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 925
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 926 行发现可疑模式: ${dataset.log}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 926
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 927 行发现可疑模式: ${dataset.min}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 927
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 928 行发现可疑模式: ${dataset.max}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 928
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 929 行发现可疑模式: ${dataset.alarm}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 929
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 952 行发现可疑模式: ${project.title}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 952
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 956 行发现可疑模式: ${group.title}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 956
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 956 行发现可疑模式: ${group.widget}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 956
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 959 行发现可疑模式: ${group.title}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 959
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 959 行发现可疑模式: ${dataset.title}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 959
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 959 行发现可疑模式: ${dataset.units}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 959
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 959 行发现可疑模式: ${dataset.widget}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 959
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 959 行发现可疑模式: ${dataset.index}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 959
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 959 行发现可疑模式: ${dataset.graph}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 959
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 959 行发现可疑模式: ${dataset.fft}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 959
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 959 行发现可疑模式: ${dataset.led}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 959
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 959 行发现可疑模式: ${dataset.log}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 959
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 959 行发现可疑模式: ${dataset.min}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 959
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 959 行发现可疑模式: ${dataset.max}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 959
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 959 行发现可疑模式: ${dataset.alarm}
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 959
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 495 行发现可疑模式: ';
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  /**
   * 显示项目编辑器
   */
  public show(): void {
    if (this._view) {
      this._view.show?.(true);
    }
  }

  /**
   * 打开项目文件
   */
  public async openProject(filePath?: string): Promise<void> {
    await this.projectManager.openProjectFile(filePath);
  }

  /**
   * 创建新项目
   */
  public async newProject(): Promise<void> {
    await this.projectManager.createNewProject();
  }

  /**
   * 保存项目
   */
  public async saveProject(askPath: boolean = false): Promise<void> {
    await this.projectManager.saveProjectFile(askPath);
  }

  // ==================== 第19周：高级导入导出功能实现 ====================

  /**
   * 处理Serial-Studio项目导入
   */
  private async handleImportSerialStudioProject(message: any): Promise<void> {
    try {
      let filePath = message.filePath;
      
      // 如果没有提供路径，显示文件选择对话框
      if (!filePath) {
        const result = await vscode.window.showOpenDialog({
          canSelectFiles: true,
          canSelectFolders: false,
          canSelectMany: false,
          filters: {
            '
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 495
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 786 行发现可疑模式: ', 
        data: progress
      });

      // 创建输出目录
      await fs.mkdir(config.outputDir, { recursive: true });

      // 逐个导出格式
      for (let i = 0; i < config.formats.length; i++) {
        const format = config.formats[i];
        
        progress.current = i + 1;
        progress.progress = Math.round((i / config.formats.length) * 100);
        progress.message = `Exporting to ${format.type.toUpperCase()}...`;
        progress.status = '
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 786
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 902 行发现可疑模式: ';
    xml += '
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 902
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 903 行发现可疑模式: ';
    xml += `  <title>${escapeXml(project.title)}</title>\n`;
    xml += `  <decoder>${project.decoder}</decoder>\n`;
    xml += `  <frameDetection>${project.frameDetection}</frameDetection>\n`;
    xml += `  <frameStart>${escapeXml(project.frameStart)}</frameStart>\n`;
    xml += `  <frameEnd>${escapeXml(project.frameEnd)}</frameEnd>\n`;
    
    xml += '
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 903
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 910 行发现可疑模式: ';
    project.groups.forEach(group => {
      xml += '
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 910
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 912 行发现可疑模式: ';
      xml += `      <title>${escapeXml(group.title)}</title>\n`;
      xml += `      <widget>${escapeXml(group.widget)}</widget>\n`;
      xml += '
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 912
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 915 行发现可疑模式: ';
      
      group.datasets.forEach(dataset => {
        xml += '
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 915
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 918 行发现可疑模式: ';
        xml += `          <title>${escapeXml(dataset.title)}</title>\n`;
        xml += `          <units>${escapeXml(dataset.units)}</units>\n`;
        xml += `          <widget>${escapeXml(dataset.widget)}</widget>\n`;
        xml += `          <index>${dataset.index}</index>\n`;
        xml += `          <graph>${dataset.graph}</graph>\n`;
        xml += `          <fft>${dataset.fft}</fft>\n`;
        xml += `          <led>${dataset.led}</led>\n`;
        xml += `          <log>${dataset.log}</log>\n`;
        xml += `          <min>${dataset.min}</min>\n`;
        xml += `          <max>${dataset.max}</max>\n`;
        xml += `          <alarm>${dataset.alarm}</alarm>\n`;
        xml += '
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 918
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 930 行发现可疑模式: ';
      });
      
      xml += '
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 930
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 933 行发现可疑模式: ';
      xml += '
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 933
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 934 行发现可疑模式: ';
    });
    xml += '
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 934
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 936 行发现可疑模式: ';
    
    xml += '
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 936
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/Checksum.ts 第 185 行发现可疑模式: ${algorithm}
- **文件**: shared/Checksum.ts
- **行号**: 185
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/Checksum.ts 第 192 行发现可疑模式: ${algorithm}
- **文件**: shared/Checksum.ts
- **行号**: 192
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/Checksum.ts 第 204 行发现可疑模式: ':
      return await sha256Hash(data);
    default:
      return checksum(algorithm, data);
  }
}

/**
 * 验证数据的校验和
 */
export function validateChecksum(
  algorithm: string,
  data: Uint8Array,
  expectedChecksum: Uint8Array,
  seed: number = 0
): boolean {
  const calculated = checksum(algorithm, data, seed);
  
  if (calculated.length !== expectedChecksum.length) {
    return false;
  }
  
  for (let i = 0; i < calculated.length; i++) {
    if (calculated[i] !== expectedChecksum[i]) {
      return false;
    }
  }
  
  return true;
}

/**
 * 获取指定算法的校验和长度
 */
export function getChecksumLength(algorithm: string): number {
  const testData = new Uint8Array([0x00]);
  const result = checksum(algorithm, testData);
  return result.length;
}

/**
 * 校验和实用工具
 */
export const ChecksumUtils = {
  /**
   * 将字节数组转换为十六进制字符串
   */
  toHexString(data: Uint8Array): string {
    return Array.from(data)
      .map(b => b.toString(16).padStart(2, '
- **文件**: shared/Checksum.ts
- **行号**: 204
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/Checksum.ts 第 254 行发现可疑模式: ');
  },

  /**
   * 从十六进制字符串解析字节数组
   */
  fromHexString(hexString: string): Uint8Array {
    const hex = hexString.replace(/\s+/g, '
- **文件**: shared/Checksum.ts
- **行号**: 254
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/CircularBuffer.ts 第 50 行发现可疑模式: ');
    }
    const effectiveIndex = (this.head + index) % this._capacity;
    return this.buffer[effectiveIndex];
  }

  /**
   * 清空缓冲区
   */
  clear(): void {
    this._size = 0;
    this.head = 0;
    this.tail = 0;
  }

  /**
   * 追加数据到缓冲区
   * 完整实现Serial-Studio的append逻辑
   */
  append(data: Uint8Array): void {
    const dataSize = data.length;
    if (dataSize === 0) return;

    let src = data;
    let copySize = dataSize;

    // 如果输入数据过大，只保留能容纳的最后部分
    if (copySize > this._capacity) {
      const offset = copySize - this._capacity;
      src = data.slice(offset);
      copySize = this._capacity;
    }

    // 如果空间不足，推进head指针覆盖旧数据
    if (copySize > this.freeSpace) {
      const overwrite = copySize - this.freeSpace;
      this.head = (this.head + overwrite) % this._capacity;
      this._size -= overwrite;
    }

    // 复制第一块数据（可能跨越缓冲区边界）
    const firstChunk = Math.min(copySize, this._capacity - this.tail);
    this.buffer.set(src.slice(0, firstChunk), this.tail);

    // 复制第二块数据（如果有回卷）
    if (copySize > firstChunk) {
      this.buffer.set(src.slice(firstChunk), 0);
    }

    // 更新tail指针和大小
    this.tail = (this.tail + copySize) % this._capacity;
    this._size = Math.min(this._size + copySize, this._capacity);
  }

  /**
   * 设置缓冲区容量
   */
  setCapacity(capacity: number): void {
    this.clear();
    this._capacity = capacity;
    this.buffer = new Uint8Array(capacity);
  }

  /**
   * 获取当前数据大小
   */
  get size(): number {
    return this._size;
  }

  /**
   * 获取缓冲区容量
   */
  get capacity(): number {
    return this._capacity;
  }

  /**
   * 获取空闲空间
   */
  get freeSpace(): number {
    return this._capacity - this._size;
  }

  /**
   * 读取数据（从缓冲区中移除）
   */
  read(size: number): Uint8Array {
    if (size > this._size) {
      throw new Error('
- **文件**: shared/CircularBuffer.ts
- **行号**: 50
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/DataCache.ts 第 82 行发现可疑模式: '
}

/**
 * 高性能数据缓存类
 * 提供多种缓存策略和优化功能
 */
export class DataCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private accessOrder: string[] = []; // LRU 访问顺序
  private cleanupTimer: NodeJS.Timeout | null = null;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    size: 0,
    memoryUsage: 0,
    expiredEntries: 0,
    evictedEntries: 0,
    averageAccessTime: 0
  };

  private readonly options: Required<CacheOptions>;

  constructor(options: CacheOptions = {}) {
    this.options = {
      maxSize: options.maxSize || 1000,
      maxMemory: options.maxMemory || 100 * 1024 * 1024, // 100MB
      defaultTTL: options.defaultTTL || 5 * 60 * 1000, // 5分钟
      cleanupInterval: options.cleanupInterval || 60 * 1000, // 1分钟
      enableLRU: options.enableLRU !== false,
      enableCompression: options.enableCompression || false,
      enableStats: options.enableStats !== false
    };

    this.startCleanupTimer();
  }

  /**
   * 设置缓存条目
   * 
   * @param key 缓存键
   * @param data 要缓存的数据
   * @param ttl 生存时间（毫秒），0表示永不过期
   * @param priority 优先级（0-100，越高越重要）
   * @param tags 标签数组
   */
  set(key: string, data: T, ttl?: number, priority: number = 50, tags?: string[]): void {
    const now = Date.now();
    const actualTTL = ttl !== undefined ? ttl : this.options.defaultTTL;
    const expiry = actualTTL === 0 ? Infinity : now + actualTTL;
    
    // 计算数据大小
    const size = this.estimateSize(data);
    
    // 创建缓存条目
    const entry: CacheEntry<T> = {
      data,
      expiry,
      created: now,
      lastAccessed: now,
      accessCount: 0,
      size,
      priority,
      tags
    };

    // 检查是否需要淘汰
    this.ensureCapacity(size);

    // 更新缓存
    if (this.cache.has(key)) {
      // 更新现有条目
      const oldEntry = this.cache.get(key)!;
      this.stats.memoryUsage -= oldEntry.size;
    } else {
      this.stats.size++;
    }

    this.cache.set(key, entry);
    this.stats.memoryUsage += size;

    // 更新LRU顺序
    if (this.options.enableLRU) {
      this.updateAccessOrder(key);
    }

    this.updateStats();
  }

  /**
   * 获取缓存条目
   * 
   * @param key 缓存键
   * @returns 缓存的数据，如果不存在或已过期则返回undefined
   */
  get(key: string): T | undefined {
    const startTime = this.options.enableStats ? performance.now() : 0;
    
    const entry = this.cache.get(key);
    
    if (!entry) {
      if (this.options.enableStats) {
        this.stats.misses++;
      }
      return undefined;
    }

    // 检查是否过期
    const now = Date.now();
    if (entry.expiry < now) {
      this.delete(key);
      if (this.options.enableStats) {
        this.stats.misses++;
        this.stats.expiredEntries++;
      }
      return undefined;
    }

    // 更新访问信息
    entry.lastAccessed = now;
    entry.accessCount++;

    // 更新LRU顺序
    if (this.options.enableLRU) {
      this.updateAccessOrder(key);
    }

    // 更新统计
    if (this.options.enableStats) {
      this.stats.hits++;
      const accessTime = performance.now() - startTime;
      this.updateAverageAccessTime(accessTime);
    }

    return entry.data;
  }

  /**
   * 检查缓存键是否存在且未过期
   * 
   * @param key 缓存键
   * @returns 是否存在
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (entry.expiry < now) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 删除缓存条目
   * 
   * @param key 缓存键
   * @returns 是否成功删除
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    this.cache.delete(key);
    this.stats.size--;
    this.stats.memoryUsage -= entry.size;

    // 从LRU顺序中移除
    if (this.options.enableLRU) {
      const index = this.accessOrder.indexOf(key);
      if (index !== -1) {
        this.accessOrder.splice(index, 1);
      }
    }

    this.updateStats();
    return true;
  }

  /**
   * 根据标签批量删除
   * 
   * @param tag 标签
   * @returns 删除的条目数
   */
  deleteByTag(tag: string): number {
    let deletedCount = 0;
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags && entry.tags.includes(tag)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      if (this.delete(key)) {
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.stats.size = 0;
    this.stats.memoryUsage = 0;
    this.updateStats();
  }

  /**
   * 获取所有缓存键
   * 
   * @param includeExpired 是否包含已过期的键
   * @returns 缓存键数组
   */
  keys(includeExpired: boolean = false): string[] {
    if (includeExpired) {
      return Array.from(this.cache.keys());
    }

    const now = Date.now();
    const validKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry >= now) {
        validKeys.push(key);
      }
    }

    return validKeys;
  }

  /**
   * 获取缓存统计信息
   * 
   * @returns 统计信息
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * 清理过期条目
   * 
   * @returns 清理的条目数
   */
  cleanup(): number {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry < now) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.delete(key);
    }

    if (expiredKeys.length > 0) {
      this.stats.expiredEntries += expiredKeys.length;
    }

    return expiredKeys.length;
  }

  /**
   * 获取缓存条目信息
   * 
   * @param key 缓存键
   * @returns 条目信息，不包含数据本身
   */
  getEntryInfo(key: string): Omit<CacheEntry<T>, '
- **文件**: shared/DataCache.ts
- **行号**: 82
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/DataCache.ts 第 365 行发现可疑模式: '> | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    const { data, ...info } = entry;
    return info;
  }

  /**
   * 批量获取
   * 
   * @param keys 缓存键数组
   * @returns 键值对映射
   */
  getMultiple(keys: string[]): Map<string, T> {
    const result = new Map<string, T>();

    for (const key of keys) {
      const value = this.get(key);
      if (value !== undefined) {
        result.set(key, value);
      }
    }

    return result;
  }

  /**
   * 批量设置
   * 
   * @param entries 键值对数组
   * @param ttl 生存时间
   * @param priority 优先级
   */
  setMultiple(entries: Array<[string, T]>, ttl?: number, priority?: number): void {
    for (const [key, value] of entries) {
      this.set(key, value, ttl, priority);
    }
  }

  /**
   * 更新TTL
   * 
   * @param key 缓存键
   * @param ttl 新的TTL（毫秒）
   * @returns 是否成功更新
   */
  updateTTL(key: string, ttl: number): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    entry.expiry = ttl === 0 ? Infinity : now + ttl;
    return true;
  }

  /**
   * 销毁缓存实例
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
  }

  // 私有方法

  /**
   * 启动清理定时器
   */
  private startCleanupTimer(): void {
    if (this.options.cleanupInterval > 0) {
      this.cleanupTimer = setInterval(() => {
        this.cleanup();
      }, this.options.cleanupInterval);
    }
  }

  /**
   * 确保缓存容量
   * 
   * @param newEntrySize 新条目大小
   */
  private ensureCapacity(newEntrySize: number): void {
    // 检查内存限制
    while (this.stats.memoryUsage + newEntrySize > this.options.maxMemory && this.cache.size > 0) {
      this.evictOne();
    }

    // 检查条目数限制
    while (this.cache.size >= this.options.maxSize && this.cache.size > 0) {
      this.evictOne();
    }
  }

  /**
   * 淘汰一个条目
   */
  private evictOne(): void {
    let keyToEvict: string | null = null;

    if (this.options.enableLRU && this.accessOrder.length > 0) {
      // LRU策略：淘汰最久未访问的
      keyToEvict = this.accessOrder[0];
    } else {
      // 简单策略：淘汰第一个条目
      keyToEvict = this.cache.keys().next().value;
    }

    if (keyToEvict) {
      this.delete(keyToEvict);
      this.stats.evictedEntries++;
    }
  }

  /**
   * 更新LRU访问顺序
   * 
   * @param key 缓存键
   */
  private updateAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index !== -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);
  }

  /**
   * 估算数据大小
   * 
   * @param data 数据
   * @returns 估算大小（字节）
   */
  private estimateSize(data: T): number {
    if (data === null || data === undefined) return 0;
    
    if (typeof data === '
- **文件**: shared/DataCache.ts
- **行号**: 365
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/DataCache.ts 第 512 行发现可疑模式: ') {
      return 1;
    }
    
    if (data instanceof ArrayBuffer) {
      return data.byteLength;
    }
    
    if (data instanceof Uint8Array) {
      return data.byteLength;
    }
    
    if (Array.isArray(data)) {
      return data.reduce((sum, item) => sum + this.estimateSize(item), 0);
    }
    
    if (typeof data === '
- **文件**: shared/DataCache.ts
- **行号**: 512
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/DataCompression.ts 第 361 行发现可疑模式: ${compressed.algorithm}
- **文件**: shared/DataCompression.ts
- **行号**: 361
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/DataCompression.ts 第 131 行发现可疑模式: ');
    }

    const result: number[] = [];
    
    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      const count = counts[i];
      
      for (let j = 0; j < count; j++) {
        result.push(value);
      }
    }

    return result;
  }
}

/**
 * LZ4风格的简化压缩算法
 * 适用于实时数据流的快速压缩
 */
export class SimpleCompressor {
  private static readonly WINDOW_SIZE = 4096;
  private static readonly MIN_MATCH_LENGTH = 4;
  private static readonly MAX_MATCH_LENGTH = 15;

  /**
   * 简化的字典压缩
   */
  static compress(data: Uint8Array): CompressedData {
    const originalSize = data.length;
    
    if (originalSize === 0) {
      return {
        data: new Uint8Array(),
        originalSize: 0,
        compressedSize: 0,
        compressionRatio: 1,
        algorithm: '
- **文件**: shared/DataCompression.ts
- **行号**: 131
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/DataCompression.ts 第 170 行发现可疑模式: '
      };
    }

    // 简化实现：只做简单的重复模式检测
    const compressed: number[] = [];
    let pos = 0;

    while (pos < data.length) {
      let bestMatchLength = 0;
      let bestMatchDistance = 0;
      
      // 在窗口内查找最优匹配
      const windowStart = Math.max(0, pos - this.WINDOW_SIZE);
      
      for (let i = windowStart; i < pos; i++) {
        let matchLength = 0;
        
        // 计算匹配长度
        while (
          matchLength < this.MAX_MATCH_LENGTH &&
          pos + matchLength < data.length &&
          data[i + matchLength] === data[pos + matchLength]
        ) {
          matchLength++;
        }
        
        // 更新最优匹配
        if (matchLength >= this.MIN_MATCH_LENGTH && matchLength > bestMatchLength) {
          bestMatchLength = matchLength;
          bestMatchDistance = pos - i;
        }
      }
      
      if (bestMatchLength >= this.MIN_MATCH_LENGTH) {
        // 输出匹配标记：负数表示匹配
        compressed.push(-bestMatchDistance);
        compressed.push(bestMatchLength);
        pos += bestMatchLength;
      } else {
        // 输出字面字符
        compressed.push(data[pos]);
        pos++;
      }
    }

    // 转换为字节数组
    const compressedData = new Uint8Array(compressed.length * 2); // 简化处理
    let offset = 0;
    
    for (const value of compressed) {
      if (value < 0) {
        // 负数：匹配距离
        compressedData[offset++] = 0xFF; // 标记位
        compressedData[offset++] = (-value) & 0xFF;
      } else if (offset > 0 && compressedData[offset - 2] === 0xFF) {
        // 匹配长度
        compressedData[offset++] = value & 0xFF;
      } else {
        // 字面字符
        compressedData[offset++] = value & 0xFF;
      }
    }

    const finalData = compressedData.slice(0, offset);
    const compressedSize = finalData.length;
    
    return {
      data: finalData,
      originalSize,
      compressedSize,
      compressionRatio: originalSize / compressedSize,
      algorithm: '
- **文件**: shared/DataCompression.ts
- **行号**: 170
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/DataCompression.ts 第 242 行发现可疑模式: '
    };
  }

  /**
   * 解压缩数据
   */
  static decompress(compressed: CompressedData): Uint8Array {
    if (compressed.originalSize === 0) {
      return new Uint8Array();
    }

    const data = compressed.data;
    const result: number[] = [];
    let pos = 0;

    while (pos < data.length) {
      if (data[pos] === 0xFF && pos + 2 < data.length) {
        // 匹配模式
        const distance = data[pos + 1];
        const length = data[pos + 2];
        
        // 复制匹配的数据
        const startPos = result.length - distance;
        for (let i = 0; i < length; i++) {
          result.push(result[startPos + i]);
        }
        
        pos += 3;
      } else {
        // 字面字符
        result.push(data[pos]);
        pos++;
      }
    }

    return new Uint8Array(result);
  }
}

/**
 * 数据压缩管理器
 * 统一管理各种压缩算法
 */
export class DataCompressor {
  private static readonly COMPRESSION_THRESHOLD = 100; // 最小压缩数据大小

  /**
   * 自动选择最佳压缩算法
   */
  static compressAuto(data: DataPoint[]): CompressedData {
    if (data.length === 0) {
      return {
        data: new Uint8Array(),
        originalSize: 0,
        compressedSize: 0,
        compressionRatio: 1,
        algorithm: '
- **文件**: shared/DataCompression.ts
- **行号**: 242
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/DataCompression.ts 第 299 行发现可疑模式: '
      };
    }

    // 小数据集不压缩
    if (data.length < this.COMPRESSION_THRESHOLD) {
      return this.serializeUncompressed(data);
    }

    // 尝试Delta + RLE组合压缩
    const deltaResult = DeltaEncoder.encode(data);
    const rleResult = RunLengthEncoder.encode(deltaResult.deltas);
    
    // 序列化结果
    const serialized = this.serializeDeltaRLE({
      baseline: deltaResult.baseline,
      values: rleResult.values,
      counts: rleResult.counts
    });

    // 计算压缩效果
    const originalSize = this.estimateDataSize(data);
    const compressedSize = serialized.length;
    
    if (compressedSize >= originalSize * 0.8) {
      // 压缩效果不好，返回未压缩数据
      return this.serializeUncompressed(data);
    }

    return {
      data: serialized,
      originalSize,
      compressedSize,
      compressionRatio: originalSize / compressedSize,
      algorithm: '
- **文件**: shared/DataCompression.ts
- **行号**: 299
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/DataCompression.ts 第 356 行发现可疑模式: ':
        const decompressed = SimpleCompressor.decompress(compressed);
        return this.deserializeUncompressed(decompressed);
      
      default:
        console.warn(`Unknown compression algorithm: ${compressed.algorithm}`);
        return [];
    }
  }

  /**
   * 序列化未压缩数据
   */
  private static serializeUncompressed(data: DataPoint[]): CompressedData {
    const buffer = new ArrayBuffer(data.length * 16); // 每个数据点16字节
    const view = new DataView(buffer);
    let offset = 0;

    for (const point of data) {
      view.setFloat64(offset, point.timestamp, true);
      view.setFloat64(offset + 8, point.value, true);
      offset += 16;
    }

    const serialized = new Uint8Array(buffer);
    
    return {
      data: serialized,
      originalSize: serialized.length,
      compressedSize: serialized.length,
      compressionRatio: 1,
      algorithm: '
- **文件**: shared/DataCompression.ts
- **行号**: 356
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/FrameParser.ts 第 165 行发现可疑模式: ${script}
- **文件**: shared/FrameParser.ts
- **行号**: 165
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/FrameParser.ts 第 192 行发现可疑模式: ');
      return this.defaultParse(frameData);
    }

    try {
      // 更新序列号
      this.context.__sequence++;
      
      // 执行编译后的函数
      const parseFunction = this.compiledFunction.apply(null, Object.values(this.context));
      
      // 转换数据格式
      let inputData: string;
      if (frameData instanceof Uint8Array) {
        inputData = new TextDecoder().decode(frameData);
      } else {
        inputData = frameData;
      }
      
      // 调用parse函数
      const result = parseFunction(inputData);
      
      // 验证结果类型
      if (Array.isArray(result)) {
        return result;
      } else if (result !== null && result !== undefined) {
        return [result];
      } else {
        return [];
      }
    } catch (error) {
      console.error('
- **文件**: shared/FrameParser.ts
- **行号**: 192
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/FrameParser.ts 第 346 行发现可疑模式: ', error);
      return [];
    }
  }

  /**
   * 批量解析多个帧
   */
  parseMultiple(frames: (string | Uint8Array)[]): any[][] {
    return frames.map(frame => this.parse(frame));
  }

  /**
   * 验证脚本语法是否正确
   */
  validateSyntax(script: string): { valid: boolean; error?: string } {
    return this.sandbox.validateSyntax(script);
  }

  /**
   * 启用或禁用解析器
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * 检查解析器是否启用
   */
  isParserEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * 获取当前加载的脚本
   */
  getScript(): string {
    return this.sandbox.getScript();
  }

  /**
   * 检查是否已加载脚本
   */
  hasScript(): boolean {
    return this.sandbox.hasScript();
  }

  /**
   * 清空解析器
   */
  clear(): void {
    this.sandbox.clearScript();
    this.resetPerformanceMetrics();
  }

  /**
   * 更新性能指标
   */
  private updatePerformanceMetrics(executionTime: number): void {
    this.performanceMetrics.totalExecutions++;
    this.performanceMetrics.totalTime += executionTime;
    this.performanceMetrics.lastExecutionTime = executionTime;
    this.performanceMetrics.averageTime = 
      this.performanceMetrics.totalTime / this.performanceMetrics.totalExecutions;
  }

  /**
   * 重置性能指标
   */
  private resetPerformanceMetrics(): void {
    this.performanceMetrics = {
      totalExecutions: 0,
      totalTime: 0,
      averageTime: 0,
      lastExecutionTime: 0
    };
  }

  /**
   * 获取性能统计信息
   */
  getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }

  /**
   * 创建示例脚本（用于教学和测试）
   */
  static createExampleScript(): string {
    return `
// Serial-Studio Frame Parser Example
// This function will be called for each received frame

function parse(frame) {
  // Convert frame to string if it'
- **文件**: shared/FrameParser.ts
- **行号**: 346
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/FrameParser.ts 第 452 行发现可疑模式: ');
  var result = [];
  
  for (var i = 0; i < values.length; i++) {
    var value = values[i].trim();
    
    // Try to convert to number
    var num = parseFloat(value);
    if (!isNaN(num)) {
      result.push(num);
    } else {
      result.push(value);
    }
  }
  
  return result;
}
    `.trim();
  }

  /**
   * 创建高级示例脚本（JSON解析）
   */
  static createJsonExampleScript(): string {
    return `
// JSON Frame Parser Example
// Parse JSON formatted data frames

function parse(frame) {
  try {
    var data = frame.toString().trim();
    
    // Try to parse as JSON
    var json = JSON.parse(data);
    
    // Extract values from JSON object
    var result = [];
    
    if (typeof json === '
- **文件**: shared/FrameParser.ts
- **行号**: 452
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的Command Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/FrameParser.ts 第 117 行发现可疑模式: Function(
- **文件**: shared/FrameParser.ts
- **行号**: 117
- **CWE ID**: CWE-78
- **建议**: 避免执行外部命令，使用安全的API替代

### 🔴 潜在的Command Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/FrameParser.ts 第 182 行发现可疑模式: function(
- **文件**: shared/FrameParser.ts
- **行号**: 182
- **CWE ID**: CWE-78
- **建议**: 避免执行外部命令，使用安全的API替代

### 🔴 潜在的Command Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/FrameParser.ts 第 212 行发现可疑模式: Function(
- **文件**: shared/FrameParser.ts
- **行号**: 212
- **CWE ID**: CWE-78
- **建议**: 避免执行外部命令，使用安全的API替代

### 🔴 潜在的Command Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/FrameParser.ts 第 263 行发现可疑模式: Function(
- **文件**: shared/FrameParser.ts
- **行号**: 263
- **CWE ID**: CWE-78
- **建议**: 避免执行外部命令，使用安全的API替代

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/FrameReader.ts 第 187 行发现可疑模式: ') {
        delimiter = this.finishSequence;
        endIndex = buffer.findPatternKMP(delimiter);
      }

      // 未找到帧
      if (endIndex === -1) {
        break;
      }

      // 提取帧数据
      const frame = buffer.peek(endIndex);
      const crcPosition = endIndex + delimiter.length;
      const frameEndPos = crcPosition + this.checksumLength;

      // 读取帧
      if (frame.length > 0) {
        // 验证校验和并注册帧
        const result = this.validateChecksum(frame, buffer, crcPosition);
        if (result === ValidationStatus.FrameOk) {
          this.frameQueue.push(frame.slice()); // 创建副本
          buffer.read(frameEndPos);
        }
        // 数据不完整，无法计算校验和
        else if (result === ValidationStatus.ChecksumIncomplete) {
          break;
        }
        // 错誤的校验和
        else {
          buffer.read(frameEndPos);
        }
      }
      // 无效帧
      else {
        buffer.read(frameEndPos);
      }
    }
  }

  /**
   * 读取以开始分隔符开头的帧
   * 完整实现Serial-Studio的readStartDelimitedFrames方法
   */
  private readStartDelimitedFrames(buffer: CircularBuffer): void {
    while (true) {
      // 在缓冲区中查找第一个开始分隔符
      const startIndex = buffer.findPatternKMP(this.startSequence);
      if (startIndex === -1) {
        break;
      }

      // 尝试在这个后找到下一个开始分隔符
      const nextStartIndex = buffer.findPatternKMP(
        this.startSequence,
        startIndex + this.startSequence.length
      );

      // 计算当前帧的开始和结束位置
      let frameEndPos: number;
      const frameStart = startIndex + this.startSequence.length;

      // 没有找到第二个开始分隔符，可能是流中的最后一帧
      if (nextStartIndex === -1) {
        frameEndPos = buffer.size;
        if (frameEndPos - frameStart < this.checksumLength) {
          break;
        }
      }
      // 找到有效的第二个开始分隔符
      else {
        frameEndPos = nextStartIndex;
      }

      // 计算帧长度并验证合理性
      const frameLength = frameEndPos - frameStart;
      if (frameLength <= 0) {
        buffer.read(frameEndPos);
        continue;
      }

      // 计算校验和位置并验证合理性
      const crcPosition = frameEndPos - this.checksumLength;
      if (crcPosition < frameStart) {
        buffer.read(frameEndPos);
        continue;
      }

      // 构建帧字节数组
      const fullData = buffer.peek(frameEndPos);
      const frame = fullData.slice(frameStart, frameStart + frameLength - this.checksumLength);

      // 验证帧
      if (frame.length > 0) {
        // 执行校验和算法并注册帧
        const result = this.validateChecksum(frame, buffer, crcPosition);
        if (result === ValidationStatus.FrameOk) {
          this.frameQueue.push(frame.slice());
          buffer.read(frameEndPos);
        }
        // 还没有足够的字节来计算校验和，等待更多
        else if (result === ValidationStatus.ChecksumIncomplete) {
          break;
        }
        // 无效校验和，丢弃并继续
        else {
          buffer.read(frameEndPos);
        }
      }
      // 空帧或无效数据，丢弃
      else {
        buffer.read(frameEndPos);
      }
    }
  }

  /**
   * 读取使用开始和结束分隔符的帧
   * 完整实现Serial-Studio的readStartEndDelimitedFrames方法
   */
  private readStartEndDelimitedFrames(buffer: CircularBuffer): void {
    while (true) {
      // 定位结束分隔符
      const finishIndex = buffer.findPatternKMP(this.finishSequence);
      if (finishIndex === -1) {
        break;
      }

      // 定位开始分隔符并确保它在结束之前
      const startIndex = buffer.findPatternKMP(this.startSequence);
      if (startIndex === -1 || startIndex >= finishIndex) {
        buffer.read(finishIndex + this.finishSequence.length);
        continue;
      }

      // 确定载荷边界
      const frameStart = startIndex + this.startSequence.length;
      const frameLength = finishIndex - frameStart;
      if (frameLength <= 0) {
        buffer.read(finishIndex + this.finishSequence.length);
        continue;
      }

      // 提取帧数据
      const crcPosition = finishIndex + this.finishSequence.length;
      const frameEndPos = crcPosition + this.checksumLength;
      const fullData = buffer.peek(frameStart + frameLength);
      const frame = fullData.slice(frameStart, frameStart + frameLength);

      // 读取帧
      if (frame.length > 0) {
        // 验证校验和并注册帧
        const result = this.validateChecksum(frame, buffer, crcPosition);
        if (result === ValidationStatus.FrameOk) {
          this.frameQueue.push(frame.slice());
          buffer.read(frameEndPos);
        }
        // 数据不完整，无法计算校验和
        else if (result === ValidationStatus.ChecksumIncomplete) {
          break;
        }
        // 错誤的校验和
        else {
          buffer.read(frameEndPos);
        }
      }
      // 无效帧
      else {
        buffer.read(frameEndPos);
      }
    }
  }

  /**
   * 验证帧的校验和
   * 完整实现Serial-Studio的checksum方法
   */
  private validateChecksum(
    frame: Uint8Array,
    buffer: CircularBuffer,
    crcPosition: number
  ): ValidationStatus {
    // 如果校验和为空，早期停止
    if (this.checksumLength === 0) {
      return ValidationStatus.FrameOk;
    }

    // 验证我们可以读取校验和
    const bufferData = buffer.peek(buffer.size);
    if (bufferData.length < crcPosition + this.checksumLength) {
      return ValidationStatus.ChecksumIncomplete;
    }

    // 比较实际与接收的校验和
    const calculated = checksum(this.checksumAlgorithm, frame);
    const received = bufferData.slice(crcPosition, crcPosition + this.checksumLength);
    
    if (this.arraysEqual(calculated, received)) {
      return ValidationStatus.FrameOk;
    }

    // 记录校验和不匹配
    console.warn('
- **文件**: shared/FrameReader.ts
- **行号**: 187
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的Command Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/FrameReader.ts 第 85 行发现可疑模式: Function(
- **文件**: shared/FrameReader.ts
- **行号**: 85
- **CWE ID**: CWE-78
- **建议**: 避免执行外部命令，使用安全的API替代

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/HighFrequencyRenderer.ts 第 346 行发现可疑模式: ${task.widgetId}
- **文件**: shared/HighFrequencyRenderer.ts
- **行号**: 346
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/HighFrequencyRenderer.ts 第 346 行发现可疑模式: ${Date.now()}
- **文件**: shared/HighFrequencyRenderer.ts
- **行号**: 346
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/HighFrequencyRenderer.ts 第 447 行发现可疑模式: ${task.widgetId}
- **文件**: shared/HighFrequencyRenderer.ts
- **行号**: 447
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/HighFrequencyRenderer.ts 第 447 行发现可疑模式: ${JSON.stringify(task.data).slice(0, 100)}
- **文件**: shared/HighFrequencyRenderer.ts
- **行号**: 447
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/HighFrequencyRenderer.ts 第 496 行发现可疑模式: ${widgetId}
- **文件**: shared/HighFrequencyRenderer.ts
- **行号**: 496
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/HighFrequencyRenderer.ts 第 504 行发现可疑模式: ${widgetId}
- **文件**: shared/HighFrequencyRenderer.ts
- **行号**: 504
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/HighFrequencyRenderer.ts 第 14 行发现可疑模式: ';
  timestamp: number;
}

/**
 * 渲染性能统计
 */
export interface RenderStats {
  fps: number;
  averageFrameTime: number;
  lastFrameTime: number;
  droppedFrames: number;
  totalFrames: number;
  cpuUsage: number;
  memoryUsage: number;
}

/**
 * 渲染配置
 */
export interface RenderConfig {
  targetFPS: number;
  maxFrameTime: number;
  enableVSync: boolean;
  enableBatching: boolean;
  batchSize: number;
  cullingEnabled: boolean;
  lodEnabled: boolean;
}

/**
 * 高性能帧率控制器
 * 精确控制渲染帧率，避免过度渲染
 */
export class FrameRateController {
  private targetInterval: number;
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private fpsHistory: number[] = [];
  private readonly historySize = 60; // 保持60帧历史
  
  constructor(targetFPS: number = 60) {
    this.targetInterval = 1000 / targetFPS;
  }

  /**
   * 检查是否应该渲染新帧
   */
  shouldRender(): boolean {
    const now = performance.now();
    const elapsed = now - this.lastFrameTime;
    
    if (elapsed >= this.targetInterval) {
      this.lastFrameTime = now;
      this.frameCount++;
      
      // 更新FPS历史
      const fps = 1000 / elapsed;
      this.fpsHistory.push(fps);
      if (this.fpsHistory.length > this.historySize) {
        this.fpsHistory.shift();
      }
      
      return true;
    }
    
    return false;
  }

  /**
   * 获取当前FPS
   */
  getCurrentFPS(): number {
    if (this.fpsHistory.length === 0) return 0;
    
    const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
    return sum / this.fpsHistory.length;
  }

  /**
   * 设置目标FPS
   */
  setTargetFPS(fps: number): void {
    this.targetInterval = 1000 / fps;
  }
  
  /**
   * 重置统计
   */
  reset(): void {
    this.lastFrameTime = 0;
    this.frameCount = 0;
    this.fpsHistory = [];
  }
}

/**
 * 渲染任务队列
 * 优先级队列，支持任务合并和批处理
 */
export class RenderQueue {
  private tasks: Map<string, RenderTask> = new Map();
  private priorityQueues: {
    high: RenderTask[];
    medium: RenderTask[];
    low: RenderTask[];
  } = {
    high: [],
    medium: [],
    low: []
  };
  private batchingEnabled = true;
  private maxBatchSize = 50;

  /**
   * 添加渲染任务
   */
  enqueue(task: RenderTask): void {
    // 合并相同组件的任务
    const existingTask = this.tasks.get(task.widgetId);
    if (existingTask) {
      // 更新现有任务
      existingTask.data = task.data;
      existingTask.timestamp = task.timestamp;
      existingTask.priority = this.getHigherPriority(existingTask.priority, task.priority);
      return;
    }

    // 添加新任务
    this.tasks.set(task.widgetId, task);
    this.priorityQueues[task.priority].push(task);
  }

  /**
   * 获取下一批任务
   */
  dequeue(maxCount: number = this.maxBatchSize): RenderTask[] {
    const result: RenderTask[] = [];
    
    // 按优先级取任务
    const priorities: Array<keyof typeof this.priorityQueues> = ['
- **文件**: shared/HighFrequencyRenderer.ts
- **行号**: 14
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/HighFrequencyRenderer.ts 第 435 行发现可疑模式: ':
        this.executeClearTasks(tasks);
        break;
    }
  }

  /**
   * 执行更新任务
   */
  private executeUpdateTasks(tasks: RenderTask[]): void {
    for (const task of tasks) {
      // 检查缓存
      const cacheKey = `${task.widgetId}-${JSON.stringify(task.data).slice(0, 100)}`;
      const cached = this.renderCache.get(cacheKey);
      
      if (cached) {
        // 使用缓存结果
        this.applyRenderResult(task.widgetId, cached);
      } else {
        // 执行渲染并缓存结果
        const result = this.performRender(task);
        this.renderCache.set(cacheKey, result);
        this.applyRenderResult(task.widgetId, result);
      }
    }
  }

  /**
   * 执行重绘任务
   */
  private executeRedrawTasks(tasks: RenderTask[]): void {
    for (const task of tasks) {
      // 重绘不使用缓存
      const result = this.performRender(task);
      this.applyRenderResult(task.widgetId, result);
    }
  }

  /**
   * 执行清空任务
   */
  private executeClearTasks(tasks: RenderTask[]): void {
    for (const task of tasks) {
      this.clearWidget(task.widgetId);
    }
  }

  /**
   * 执行实际渲染（留给具体实现）
   */
  private performRender(task: RenderTask): any {
    // 这里应该调用具体的渲染逻辑
    // 如Chart.js的update方法等
    return { rendered: true, data: task.data };
  }

  /**
   * 应用渲染结果（留给具体实现）
   */
  private applyRenderResult(widgetId: string, result: any): void {
    // 这里应该将渲染结果应用到DOM或Canvas
    console.debug(`Applying render result for widget ${widgetId}:`, result);
  }

  /**
   * 清空组件（留给具体实现）
   */
  private clearWidget(widgetId: string): void {
    // 这里应该清空组件显示
    console.debug(`Clearing widget ${widgetId}`);
  }

  /**
   * 更新性能统计
   */
  private updateRenderStats(frameTime: number): void {
    this.renderStats.lastFrameTime = frameTime;
    this.renderStats.totalFrames++;
    
    // 更新帧时间历史
    this.frameTimeHistory.push(frameTime);
    if (this.frameTimeHistory.length > 60) {
      this.frameTimeHistory.shift();
    }
    
    // 计算平均帧时间
    const sum = this.frameTimeHistory.reduce((a, b) => a + b, 0);
    this.renderStats.averageFrameTime = sum / this.frameTimeHistory.length;
    
    // 更新FPS
    this.renderStats.fps = this.frameController.getCurrentFPS();
    
    // 检查丢帧
    if (frameTime > this.config.maxFrameTime) {
      this.renderStats.droppedFrames++;
    }
    
    // 每秒更新一次内存统计
    if (Date.now() - this.lastStatsUpdate > 1000) {
      this.updateMemoryStats();
      this.lastStatsUpdate = Date.now();
    }
  }

  /**
   * 更新内存统计
   */
  private updateMemoryStats(): void {
    if ('
- **文件**: shared/HighFrequencyRenderer.ts
- **行号**: 435
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/MemoryManager.ts 第 533 行发现可疑模式: ${size}
- **文件**: shared/MemoryManager.ts
- **行号**: 533
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/MemoryManager.ts 第 604 行发现可疑模式: ${name}
- **文件**: shared/MemoryManager.ts
- **行号**: 604
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/MemoryManager.ts 第 604 行发现可疑模式: ${(stats.hitRate * 100).toFixed(1)}
- **文件**: shared/MemoryManager.ts
- **行号**: 604
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/MemoryManager.ts 第 605 行发现可疑模式: ${name}
- **文件**: shared/MemoryManager.ts
- **行号**: 605
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/MemoryManager.ts 第 609 行发现可疑模式: ${name}
- **文件**: shared/MemoryManager.ts
- **行号**: 609
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/MemoryManager.ts 第 610 行发现可疑模式: ${name}
- **文件**: shared/MemoryManager.ts
- **行号**: 610
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/MemoryManager.ts 第 616 行发现可疑模式: ${(this.memoryStats.memoryPressure * 100).toFixed(1)}
- **文件**: shared/MemoryManager.ts
- **行号**: 616
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/MemoryManager.ts 第 622 行发现可疑模式: ${this.gcCount}
- **文件**: shared/MemoryManager.ts
- **行号**: 622
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/MemoryManager.ts 第 137 行发现可疑模式: ' && item !== null) {
      // 清理数组
      if (Array.isArray(item)) {
        item.length = 0;
      }
      // 清理Map和Set
      else if (item instanceof Map || item instanceof Set) {
        item.clear();
      }
      // 清理普通对象属性
      else {
        for (const key in item) {
          if (item.hasOwnProperty(key)) {
            delete item[key];
          }
        }
      }
    }
  }

  /**
   * 检查是否需要收缩
   */
  private shouldShrink(): boolean {
    const totalSize = this.pool.length + this.inUse.size;
    const utilization = this.inUse.size / totalSize;
    return utilization < this.config.shrinkThreshold;
  }

  /**
   * 更新统计信息
   */
  private updateStats(): void {
    this.stats.size = this.pool.length + this.inUse.size;
    this.stats.used = this.inUse.size;
    this.stats.free = this.pool.length;
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * 获取统计信息
   */
  getStats(): PoolStats {
    return { ...this.stats };
  }

  /**
   * 清空池
   */
  clear(): void {
    // 释放所有在用对象
    this.inUse.clear();
    
    // 销毁池中对象
    if (this.config.itemDestructor) {
      for (const item of this.pool) {
        this.config.itemDestructor(item);
      }
    }
    
    this.pool = [];
    this.updateStats();
  }
}

/**
 * 缓冲区池
 * 专门管理字节数组的重用
 */
export class BufferPool {
  private pools: Map<number, ObjectPool<Uint8Array>> = new Map();
  private commonSizes = [64, 256, 1024, 4096, 16384, 65536]; // 常用大小
  
  constructor() {
    // 初始化常用大小的池
    for (const size of this.commonSizes) {
      this.createPoolForSize(size);
    }
  }

  /**
   * 为指定大小创建池
   */
  private createPoolForSize(size: number): void {
    const pool = new ObjectPool<Uint8Array>({
      initialSize: 10,
      maxSize: 100,
      growthFactor: 1.5,
      shrinkThreshold: 0.3,
      itemConstructor: () => new Uint8Array(size),
      itemDestructor: () => {} // Uint8Array不需要特殊清理
    });
    
    this.pools.set(size, pool);
  }

  /**
   * 获取缓冲区
   */
  acquire(size: number): Uint8Array {
    // 查找最合适的池
    let bestSize = this.findBestSize(size);
    
    if (!bestSize) {
      // 为新尺寸创建池
      bestSize = this.roundUpToPowerOfTwo(size);
      this.createPoolForSize(bestSize);
    }
    
    const pool = this.pools.get(bestSize)!;
    const buffer = pool.acquire();
    
    // 如果需要的尺寸小于缓冲区，返回子数组
    return size < buffer.length ? buffer.subarray(0, size) : buffer;
  }

  /**
   * 释放缓冲区
   */
  release(buffer: Uint8Array): void {
    const size = buffer.buffer.byteLength;
    const pool = this.pools.get(size);
    
    if (pool) {
      // 确保释放的是完整的缓冲区
      const fullBuffer = new Uint8Array(buffer.buffer);
      pool.release(fullBuffer);
    }
  }

  /**
   * 查找最合适的池尺寸
   */
  private findBestSize(size: number): number | null {
    for (const poolSize of this.pools.keys()) {
      if (poolSize >= size) {
        return poolSize;
      }
    }
    return null;
  }

  /**
   * 向上取整到二的幂次
   */
  private roundUpToPowerOfTwo(size: number): number {
    let power = 1;
    while (power < size) {
      power *= 2;
    }
    return power;
  }

  /**
   * 获取所有池的统计
   */
  getAllStats(): { [size: number]: PoolStats } {
    const stats: { [size: number]: PoolStats } = {};
    
    for (const [size, pool] of this.pools.entries()) {
      stats[size] = pool.getStats();
    }
    
    return stats;
  }

  /**
   * 清理所有池
   */
  clear(): void {
    for (const pool of this.pools.values()) {
      pool.clear();
    }
  }
}

/**
 * 弱引用管理器
 * 防止循环引用和内存泄漏
 */
export class WeakReferenceManager {
  private weakRefs: Set<WeakRef<any>> = new Set();
  private cleanupCallbacks: Map<WeakRef<any>, () => void> = new Map();
  private cleanupTimer: number | null = null;
  
  constructor() {
    this.startCleanupTimer();
  }

  /**
   * 添加弱引用
   */
  addWeakRef<T extends object>(target: T, cleanupCallback?: () => void): WeakRef<T> {
    const weakRef = new WeakRef(target);
    
    this.weakRefs.add(weakRef);
    
    if (cleanupCallback) {
      this.cleanupCallbacks.set(weakRef, cleanupCallback);
    }
    
    return weakRef;
  }

  /**
   * 移除弱引用
   */
  removeWeakRef(weakRef: WeakRef<any>): void {
    this.weakRefs.delete(weakRef);
    
    const cleanupCallback = this.cleanupCallbacks.get(weakRef);
    if (cleanupCallback) {
      cleanupCallback();
      this.cleanupCallbacks.delete(weakRef);
    }
  }

  /**
   * 开始清理定时器
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, 5000) as any; // 每5秒清理一次
  }

  /**
   * 清理已被回收的引用
   */
  private cleanup(): void {
    const toRemove: WeakRef<any>[] = [];
    
    for (const weakRef of this.weakRefs) {
      if (weakRef.deref() === undefined) {
        toRemove.push(weakRef);
      }
    }
    
    for (const weakRef of toRemove) {
      this.removeWeakRef(weakRef);
    }
  }

  /**
   * 获取统计信息
   */
  getStats() {
    let active = 0;
    let inactive = 0;
    
    for (const weakRef of this.weakRefs) {
      if (weakRef.deref() !== undefined) {
        active++;
      } else {
        inactive++;
      }
    }
    
    return {
      totalRefs: this.weakRefs.size,
      activeRefs: active,
      inactiveRefs: inactive,
      cleanupCallbacks: this.cleanupCallbacks.size
    };
  }

  /**
   * 清理资源
   */
  dispose(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    
    // 执行所有清理回调
    for (const callback of this.cleanupCallbacks.values()) {
      try {
        callback();
      } catch (error) {
        console.error('
- **文件**: shared/MemoryManager.ts
- **行号**: 137
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/MemoryManager.ts 第 466 行发现可疑模式: ')) {
              this.gcCount++;
              this.lastGCTime = entry.duration;
            }
          }
        });
        
        this.gcObserver.observe({ entryTypes: ['
- **文件**: shared/MemoryManager.ts
- **行号**: 466
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/MemoryManager.ts 第 563 行发现可疑模式: ' in window) {
      (window as any).gc();
    } else {
      // 模拟垃圾回收：创建大量临时对象并立即释放
      const temp = [];
      for (let i = 0; i < 1000; i++) {
        temp.push(new Array(1000).fill(0));
      }
      temp.length = 0;
    }
  }

  /**
   * 内存压力缓解
   */
  relieveMemoryPressure(): void {
    // 清理所有池
    for (const pool of this.objectPools.values()) {
      // 对于对象池，清理部分空闲对象
      // 这里可以添加更精细的清理逻辑
    }
    
    this.bufferPool.clear();
    
    // 强制GC
    this.forceGC();
  }

  /**
   * 检查内存泄漏
   */
  checkMemoryLeaks(): {
    potentialLeaks: string[];
    recommendations: string[];
  } {
    const leaks: string[] = [];
    const recommendations: string[] = [];
    
    // 检查池利用率
    for (const [name, stats] of Object.entries(this.memoryStats.poolStats)) {
      if (stats.hitRate < 0.5) {
        leaks.push(`Pool '
- **文件**: shared/MemoryManager.ts
- **行号**: 563
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/PerformanceMonitor.ts 第 578 行发现可疑模式: ${result.operationsPerSecond.toFixed(0)}
- **文件**: shared/PerformanceMonitor.ts
- **行号**: 578
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/PerformanceMonitor.ts 第 578 行发现可疑模式: ${baseline.targetDataProcessingRate}
- **文件**: shared/PerformanceMonitor.ts
- **行号**: 578
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/PerformanceMonitor.ts 第 585 行发现可疑模式: ${result.operationsPerSecond.toFixed(0)}
- **文件**: shared/PerformanceMonitor.ts
- **行号**: 585
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/PerformanceMonitor.ts 第 585 行发现可疑模式: ${baseline.targetDataProcessingRate / 2}
- **文件**: shared/PerformanceMonitor.ts
- **行号**: 585
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/PerformanceMonitor.ts 第 592 行发现可疑模式: ${result.operationsPerSecond.toFixed(0)}
- **文件**: shared/PerformanceMonitor.ts
- **行号**: 592
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/PerformanceMonitor.ts 第 592 行发现可疑模式: ${baseline.targetRenderingFPS}
- **文件**: shared/PerformanceMonitor.ts
- **行号**: 592
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/PerformanceMonitor.ts 第 600 行发现可疑模式: ${result.memoryDelta.toFixed(2)}
- **文件**: shared/PerformanceMonitor.ts
- **行号**: 600
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/PerformanceMonitor.ts 第 600 行发现可疑模式: ${(baseline.targetMemoryUsage * 0.1).toFixed(2)}
- **文件**: shared/PerformanceMonitor.ts
- **行号**: 600
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/PerformanceMonitor.ts 第 709 行发现可疑模式: ${metrics.updateFrequency.toFixed(1)}
- **文件**: shared/PerformanceMonitor.ts
- **行号**: 709
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/PerformanceMonitor.ts 第 713 行发现可疑模式: ${metrics.renderingFPS.toFixed(1)}
- **文件**: shared/PerformanceMonitor.ts
- **行号**: 713
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/PerformanceMonitor.ts 第 717 行发现可疑模式: ${metrics.latency.toFixed(1)}
- **文件**: shared/PerformanceMonitor.ts
- **行号**: 717
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/PerformanceMonitor.ts 第 721 行发现可疑模式: ${metrics.memoryUsage.toFixed(1)}
- **文件**: shared/PerformanceMonitor.ts
- **行号**: 721
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/PerformanceMonitor.ts 第 264 行发现可疑模式: ') {
      const stats = (globalThis as any).__performanceStats;
      const errors = stats.errorCount || 0;
      const total = stats.totalOperations || 1;
      return (errors / total) * 100;
    }
    return 0;
  }

  /**
   * 添加到历史记录
   */
  private addToHistory(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics);
    
    // 保持历史大小限制
    if (this.metrics.length > this.maxHistorySize) {
      this.metrics.shift();
    }
  }

  /**
   * 获取历史数据
   */
  getHistory(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * 获取统计数据
   */
  getStatistics() {
    if (this.metrics.length === 0) {
      return null;
    }
    
    const recent = this.metrics.slice(-60); // 最近60个样本
    
    return {
      dataProcessingRate: {
        current: recent[recent.length - 1].dataProcessingRate,
        average: recent.reduce((sum, m) => sum + m.dataProcessingRate, 0) / recent.length,
        max: Math.max(...recent.map(m => m.dataProcessingRate)),
        min: Math.min(...recent.map(m => m.dataProcessingRate))
      },
      renderingFPS: {
        current: recent[recent.length - 1].renderingFPS,
        average: recent.reduce((sum, m) => sum + m.renderingFPS, 0) / recent.length,
        max: Math.max(...recent.map(m => m.renderingFPS)),
        min: Math.min(...recent.map(m => m.renderingFPS))
      },
      updateFrequency: {
        current: recent[recent.length - 1].updateFrequency,
        average: recent.reduce((sum, m) => sum + m.updateFrequency, 0) / recent.length,
        max: Math.max(...recent.map(m => m.updateFrequency)),
        min: Math.min(...recent.map(m => m.updateFrequency))
      },
      memoryUsage: {
        current: recent[recent.length - 1].memoryUsage,
        average: recent.reduce((sum, m) => sum + m.memoryUsage, 0) / recent.length,
        max: Math.max(...recent.map(m => m.memoryUsage)),
        min: Math.min(...recent.map(m => m.memoryUsage))
      }
    };
  }

  /**
   * 清空历史数据
   */
  clear(): void {
    this.metrics = [];
  }
}

/**
 * 性能基准测试器
 */
export class PerformanceBenchmark {
  private results: BenchmarkResult[] = [];
  
  /**
   * 执行基准测试
   */
  async benchmark(
    testName: string,
    testFunction: () => Promise<any> | any,
    iterations: number = 1000,
    warmupIterations: number = 100
  ): Promise<BenchmarkResult> {
    // 预热阶段
    for (let i = 0; i < warmupIterations; i++) {
      await testFunction();
    }
    
    // 清理内存
    if ('
- **文件**: shared/PerformanceMonitor.ts
- **行号**: 264
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/PerformanceMonitor.ts 第 359 行发现可疑模式: ' in globalThis) {
      (globalThis as any).gc();
    }
    
    const memoryBefore = this.getMemoryUsage();
    const times: number[] = [];
    const startTime = performance.now();
    
    // 执行测试
    for (let i = 0; i < iterations; i++) {
      const iterationStart = performance.now();
      await testFunction();
      const iterationEnd = performance.now();
      times.push(iterationEnd - iterationStart);
    }
    
    const endTime = performance.now();
    const memoryAfter = this.getMemoryUsage();
    
    // 计算统计数据
    const totalTime = endTime - startTime;
    const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const variance = times.reduce((sum, time) => sum + Math.pow(time - averageTime, 2), 0) / times.length;
    const standardDeviation = Math.sqrt(variance);
    const operationsPerSecond = 1000 / averageTime;
    const memoryDelta = memoryAfter - memoryBefore;
    
    const result: BenchmarkResult = {
      testName,
      duration: totalTime,
      iterations,
      averageTime,
      minTime,
      maxTime,
      standardDeviation,
      operationsPerSecond,
      memoryUsageBefore: memoryBefore,
      memoryUsageAfter: memoryAfter,
      memoryDelta,
      passed: true, // 将在验证阶段设置
      details: {
        times: times.slice(0, 10), // 只保存前10个时间样本
        variance
      }
    };
    
    this.results.push(result);
    return result;
  }

  /**
   * 数据处理性能测试
   */
  async benchmarkDataProcessing(): Promise<BenchmarkResult> {
    const testData = new Uint8Array(1000).fill(42);
    
    return await this.benchmark(
      '
- **文件**: shared/PerformanceMonitor.ts
- **行号**: 359
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/PerformanceMonitor.ts 第 421 行发现可疑模式: ');
        // 这里应该调用实际的数据处理逻辑
        return testData.reduce((sum, val) => sum + val, 0);
      },
      1000,
      100
    );
  }

  /**
   * 环形缓冲区性能测试
   */
  async benchmarkCircularBuffer(): Promise<BenchmarkResult> {
    const { CircularBuffer } = await import('
- **文件**: shared/PerformanceMonitor.ts
- **行号**: 421
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/PerformanceMonitor.ts 第 477 行发现可疑模式: ');
    
    const testData = Array.from({ length: 1000 }, (_, i) => ({
      timestamp: Date.now() + i,
      value: Math.sin(i * 0.1) * 100
    }));
    
    return await this.benchmark(
      '
- **文件**: shared/PerformanceMonitor.ts
- **行号**: 477
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/PerformanceMonitor.ts 第 510 行发现可疑模式: ';
        for (let i = 0; i < 100; i++) {
          const x = Math.random() * 800;
          const y = Math.random() * 600;
          ctx.fillRect(x, y, 2, 2);
        }
        
        // 绘制线条
        ctx.strokeStyle = '
- **文件**: shared/PerformanceMonitor.ts
- **行号**: 510
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/PerformanceMonitor.ts 第 518 行发现可疑模式: ';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < 100; i++) {
          const x = i * 8;
          const y = 300 + Math.sin(i * 0.1) * 100;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      },
      1000,
      100
    );
  }

  /**
   * 执行所有基准测试
   */
  async runAllBenchmarks(): Promise<BenchmarkResult[]> {
    console.log('
- **文件**: shared/PerformanceMonitor.ts
- **行号**: 518
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/PerformanceMonitor.ts 第 793 行发现可疑模式: '增加数据处理频率以达到20Hz+目标'
- **文件**: shared/PerformanceMonitor.ts
- **行号**: 793
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的Command Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/PerformanceMonitor.ts 第 355 行发现可疑模式: Function(
- **文件**: shared/PerformanceMonitor.ts
- **行号**: 355
- **CWE ID**: CWE-78
- **建议**: 避免执行外部命令，使用安全的API替代

### 🔴 潜在的Command Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 shared/PerformanceMonitor.ts 第 370 行发现可疑模式: Function(
- **文件**: shared/PerformanceMonitor.ts
- **行号**: 370
- **CWE ID**: CWE-78
- **建议**: 避免执行外部命令，使用安全的API替代

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportIntegration.test.ts 第 98 行发现可疑模式: ').filter(line => line.length > 0);
      expect(lines.length).toBe(1001); // 1000条数据 + 1行标题
      expect(lines[0]).toContain('
- **文件**: tests/export/ExportIntegration.test.ts
- **行号**: 98
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportIntegration.test.ts 第 238 行发现可疑模式: ');
      
      // 属性格式应该包含属性
      expect(attributeContent).toMatch(/<record[^>]+>/);
      
      // 元素格式应该包含子元素
      expect(elementContent).toContain('
- **文件**: tests/export/ExportIntegration.test.ts
- **行号**: 238
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportIntegration.test.ts 第 266 行发现可疑模式: ').filter(line => line.length > 0);
      
      // 检查几行数据确保在范围内
      for (let i = 1; i <= Math.min(5, lines.length - 1); i++) {
        const values = lines[i].split('
- **文件**: tests/export/ExportIntegration.test.ts
- **行号**: 266
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportIntegration.test.ts 第 292 行发现可疑模式: ').filter(line => line.length > 0);
      
      // 检查数值精度
      for (let i = 1; i <= Math.min(5, lines.length - 1); i++) {
        const values = lines[i].split('
- **文件**: tests/export/ExportIntegration.test.ts
- **行号**: 292
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportIntegration.test.ts 第 296 行发现可疑模式: ');
        for (let j = 1; j < values.length; j++) {
          const num = parseFloat(values[j]);
          if (!isNaN(num)) {
            const decimalPlaces = (values[j].split('
- **文件**: tests/export/ExportIntegration.test.ts
- **行号**: 296
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportPerformanceBenchmark.test.ts 第 267 行发现可疑模式: ${error.message}
- **文件**: tests/export/ExportPerformanceBenchmark.test.ts
- **行号**: 267
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportPerformanceBenchmark.test.ts 第 293 行发现可疑模式: ${i}
- **文件**: tests/export/ExportPerformanceBenchmark.test.ts
- **行号**: 293
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportPerformanceBenchmark.test.ts 第 294 行发现可疑模式: ${i}
- **文件**: tests/export/ExportPerformanceBenchmark.test.ts
- **行号**: 294
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportPerformanceBenchmark.test.ts 第 406 行发现可疑模式: ${index}
- **文件**: tests/export/ExportPerformanceBenchmark.test.ts
- **行号**: 406
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportPerformanceBenchmark.test.ts 第 425 行发现可疑模式: ${index}
- **文件**: tests/export/ExportPerformanceBenchmark.test.ts
- **行号**: 425
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportPerformanceBenchmark.test.ts 第 51 行发现可疑模式: ', async () => {
      const testDuration = 1000; // 1秒
      const minUpdates = PERFORMANCE_THRESHOLDS.REALTIME_UPDATE_FREQUENCY * (testDuration / 1000);
      
      let updateCount = 0;
      const progressCallback = vi.fn(() => {
        updateCount++;
      });
      
      exportManager.onProgress(progressCallback);
      
      // 模拟实时数据更新
      const startTime = performance.now();
      const interval = setInterval(() => {
        // 触发进度更新
        exportManager.emit?.('
- **文件**: tests/export/ExportPerformanceBenchmark.test.ts
- **行号**: 51
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportPerformanceBenchmark.test.ts 第 85 行发现可疑模式: ', async () => {
      const testIterations = 100;
      const latencies: number[] = [];
      
      for (let i = 0; i < testIterations; i++) {
        const sendTime = performance.now();
        
        // 模拟数据更新
        await new Promise(resolve => {
          exportManager.onProgress(() => {
            const receiveTime = performance.now();
            latencies.push(receiveTime - sendTime);
            resolve(null);
          });
          
          // 发送更新
          exportManager.emit?.('
- **文件**: tests/export/ExportPerformanceBenchmark.test.ts
- **行号**: 85
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportPerformanceBenchmark.test.ts 第 103 行发现可疑模式: ',
            percentage: i,
            processedRecords: i * 10,
            totalRecords: testIterations * 10,
            estimatedTimeRemaining: 0
          });
        });
      }
      
      const avgLatency = latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length;
      const maxLatency = Math.max(...latencies);
      
      expect(avgLatency).toBeLessThanOrEqual(PERFORMANCE_THRESHOLDS.MAX_LATENCY);
      expect(maxLatency).toBeLessThanOrEqual(PERFORMANCE_THRESHOLDS.MAX_LATENCY * 2); // 允许偶尔超过
    });

    it('
- **文件**: tests/export/ExportPerformanceBenchmark.test.ts
- **行号**: 103
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportPerformanceBenchmark.test.ts 第 271 行发现可疑模式: ', async () => {
      const testRuns = 100;
      const results: boolean[] = [];
      
      for (let i = 0; i < testRuns; i++) {
        const testConfig: ExportConfig = {
          dataSource: {
            type: DataSourceType.CURRENT,
            datasets: ['
- **文件**: tests/export/ExportPerformanceBenchmark.test.ts
- **行号**: 271
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportPerformanceBenchmark.test.ts 第 358 行发现可疑模式: ',
            precision: 2
          },
          filters: {}
        }
      };
      
      // Mock批量导出
      batchExportManager.startBatchExport = vi.fn().mockImplementation(async () => {
        const startTime = performance.now();
        
        // 模拟批量处理
        for (let i = 0; i < expectedBatches; i++) {
          await simulateDataProcessing({ records: generateLargeDataset(batchSize) });
        }
        
        const endTime = performance.now();
        
        return {
          taskId: '
- **文件**: tests/export/ExportPerformanceBenchmark.test.ts
- **行号**: 358
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportPerformanceBenchmark.test.ts 第 512 行发现可疑模式: ', async () => {
      const iterationCount = 10;
      const memoryUsages: number[] = [];
      
      for (let i = 0; i < iterationCount; i++) {
        const testData = generateLargeDataset(5000);
        await simulateDataProcessing({ records: testData });
        
        // 强制垃圾回收
        if (global.gc) {
          global.gc();
        }
        
        memoryUsages.push(process.memoryUsage().heapUsed);
      }
      
      // 检查内存使用趋势
      const initialMemory = memoryUsages[0];
      const finalMemory = memoryUsages[memoryUsages.length - 1];
      const memoryGrowth = finalMemory - initialMemory;
      
      // 内存增长应该保持在合理范围内（允许一些正常增长）
      const maxAllowedGrowth = initialMemory * 0.2; // 20%
      expect(memoryGrowth).toBeLessThanOrEqual(maxAllowedGrowth);
    });
  });

  describe('
- **文件**: tests/export/ExportPerformanceBenchmark.test.ts
- **行号**: 512
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportQualityMetrics.test.ts 第 56 行发现可疑模式: ${duration}
- **文件**: tests/export/ExportQualityMetrics.test.ts
- **行号**: 56
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportQualityMetrics.test.ts 第 72 行发现可疑模式: ${duration}
- **文件**: tests/export/ExportQualityMetrics.test.ts
- **行号**: 72
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportQualityMetrics.test.ts 第 80 行发现可疑模式: ${i}
- **文件**: tests/export/ExportQualityMetrics.test.ts
- **行号**: 80
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportQualityMetrics.test.ts 第 109 行发现可疑模式: ${formatFileSize(memoryIncrease)}
- **文件**: tests/export/ExportQualityMetrics.test.ts
- **行号**: 109
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportQualityMetrics.test.ts 第 407 行发现可疑模式: ${j}
- **文件**: tests/export/ExportQualityMetrics.test.ts
- **行号**: 407
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportQualityMetrics.test.ts 第 407 行发现可疑模式: ${i}
- **文件**: tests/export/ExportQualityMetrics.test.ts
- **行号**: 407
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportQualityMetrics.test.ts 第 75 行发现可疑模式: ', async () => {
      const promises = [];
      const recordCounts = [1000, 2000, 1500];

      for (let i = 0; i < recordCounts.length; i++) {
        const filePath = path.join(tempDir, `concurrent-${i}.csv`);
        const config = createTestConfig(ExportFormatType.CSV, filePath);
        promises.push(exportManager.exportData(config));
      }

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.recordCount).toBe(1000); // 默认测试数据
      });
    });
  });

  describe('
- **文件**: tests/export/ExportQualityMetrics.test.ts
- **行号**: 75
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportQualityMetrics.test.ts 第 127 行发现可疑模式: ').filter(line => line.length > 0);
      expect(csvLines.length).toBe(101); // 100条数据 + 1行标题

      // 验证JSON数据
      const jsonContent = JSON.parse(fs.readFileSync(jsonPath, '
- **文件**: tests/export/ExportQualityMetrics.test.ts
- **行号**: 127
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportQualityMetrics.test.ts 第 214 行发现可疑模式: '), expectError: false }
      ];

      let errorCount = 0;
      let successCount = 0;

      for (const scenario of errorScenarios) {
        try {
          const config = createTestConfig(ExportFormatType.CSV, scenario.path);
          await exportManager.exportData(config);
          successCount++;
        } catch (error) {
          errorCount++;
          // 验证错误信息有意义
          expect(error.message).toBeTruthy();
          expect(error.message.length).toBeGreaterThan(5);
        }
      }

      // 验证错误处理覆盖率
      expect(errorCount + successCount).toBe(errorScenarios.length);
    });
  });

  describe('
- **文件**: tests/export/ExportQualityMetrics.test.ts
- **行号**: 214
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportQualityMetrics.test.ts 第 240 行发现可疑模式: ');
      const config = createTestConfig(ExportFormatType.CSV, filePath);

      const progressReports: number[] = [];
      exportManager.onProgress((progress) => {
        progressReports.push(progress.percentage);
      });

      await exportManager.exportData(config);

      // 验证进度报告
      expect(progressReports.length).toBeGreaterThan(0);
      expect(progressReports[0]).toBeGreaterThanOrEqual(0);
      expect(progressReports[progressReports.length - 1]).toBe(100);

      // 验证进度单调递增
      for (let i = 1; i < progressReports.length; i++) {
        expect(progressReports[i]).toBeGreaterThanOrEqual(progressReports[i - 1]);
      }
    });
  });

  describe('
- **文件**: tests/export/ExportQualityMetrics.test.ts
- **行号**: 240
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportQualityMetrics.test.ts 第 357 行发现可疑模式: ' };
      default:
        return {};
    }
  }

  function generateTestData(count: number): any[][] {
    const data: any[][] = [];
    for (let i = 0; i < count; i++) {
      data.push([
        new Date(Date.now() - (count - i) * 1000).toISOString(),
        20 + Math.random() * 10,
        40 + Math.random() * 30,
        1000 + Math.random() * 50
      ]);
    }
    return data;
  }

  function generatePreciseTestData(count: number): any[][] {
    const data: any[][] = [];
    for (let i = 0; i < count; i++) {
      data.push([
        new Date(2024, 0, 1, 12, i, 0).toISOString(),
        25.5 + i * 0.1,
        50.0 + i * 0.5,
        1013.25 + i * 0.01
      ]);
    }
    return data;
  }

  function generateTypedTestData(count: number): any[][] {
    const data: any[][] = [];
    for (let i = 0; i < count; i++) {
      data.push([
        new Date().toISOString(),  // string
        25.5,                      // number
        true,                      // boolean
        null                       // null
      ]);
    }
    return data;
  }

  function generateWideTestData(rows: number, columns: number): any[][] {
    const data: any[][] = [];
    for (let i = 0; i < rows; i++) {
      const row: any[] = [];
      for (let j = 0; j < columns; j++) {
        row.push(`col${j}_row${i}`);
      }
      data.push(row);
    }
    return data;
  }

  function validateTestDataConsistency(original: any[][], csvLines: string[], jsonData: any): boolean {
    // 简化的一致性检查
    return csvLines.length === original.length + 1 && // +1 for header
           jsonData.data.length === original.length;
  }

  function validateCSVFormat(content: string): boolean {
    // 简化的CSV格式验证
    const lines = content.split('
- **文件**: tests/export/ExportQualityMetrics.test.ts
- **行号**: 357
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportUIIntegration.test.ts 第 450 行发现可疑模式: ${i}
- **文件**: tests/export/ExportUIIntegration.test.ts
- **行号**: 450
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportUIIntegration.test.ts 第 451 行发现可疑模式: ${i}
- **文件**: tests/export/ExportUIIntegration.test.ts
- **行号**: 451
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportUIIntegration.test.ts 第 338 行发现可疑模式: ');
      expect(speedDisplay.exists()).toBe(true);
      expect(speedDisplay.text()).toMatch(/\d+\/s|计算中/);
    });

    it('
- **文件**: tests/export/ExportUIIntegration.test.ts
- **行号**: 338
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportUIIntegration.test.ts 第 344 行发现可疑模式: ');
      expect(etaDisplay.exists()).toBe(true);
      expect(etaDisplay.text()).toMatch(/\d+:\d+|\d+秒|未知/);
    });
  });

  describe('
- **文件**: tests/export/ExportUIIntegration.test.ts
- **行号**: 344
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportUIIntegration.test.ts 第 473 行发现可疑模式: ', async () => {
      let progressCallback: ((progress: ExportProgress) => void) | null = null;
      
      const mockExportManager = {
        onProgress: vi.fn().mockImplementation((callback) => {
          progressCallback = callback;
        }),
        offProgress: vi.fn(),
        exportData: vi.fn().mockImplementation(() => {
          return new Promise((resolve) => {
            // 模拟进度更新
            let progress = 0;
            const interval = setInterval(() => {
              progress += 10;
              if (progressCallback) {
                progressCallback({
                  taskId: '
- **文件**: tests/export/ExportUIIntegration.test.ts
- **行号**: 473
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/DataFlow.test.ts 第 154 行发现可疑模式: ${i * 0.1}
- **文件**: tests/integration/DataFlow.test.ts
- **行号**: 154
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/DataFlow.test.ts 第 236 行发现可疑模式: ${Math.random()}
- **文件**: tests/integration/DataFlow.test.ts
- **行号**: 236
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/DataFlow.test.ts 第 236 行发现可疑模式: ${Math.random()}
- **文件**: tests/integration/DataFlow.test.ts
- **行号**: 236
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/DataFlow.test.ts 第 274 行发现可疑模式: ${i}
- **文件**: tests/integration/DataFlow.test.ts
- **行号**: 274
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/DataFlow.test.ts 第 481 行发现可疑模式: ${i * 0.1}
- **文件**: tests/integration/DataFlow.test.ts
- **行号**: 481
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/DataFlow.test.ts 第 142 行发现可疑模式: ', async (frame: Frame) => {
        const datasets = await frameParser.createDatasets(frame);
        processedFrames++;
        
        messageBridge.sendToWebview({
          type: MessageType.DataUpdate,
          payload: { datasets }
        });
      });
      
      // 模拟连续数据流
      for (let i = 0; i < frameCount; i++) {
        const data = Buffer.from(`${i * 0.1}\n`);
        frameReader.processData(data);
      }
      
      expect(processedFrames).toBe(frameCount);
      expect(receivedMessages).toHaveLength(frameCount);
    });

    it('
- **文件**: tests/integration/DataFlow.test.ts
- **行号**: 142
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/DataFlow.test.ts 第 177 行发现可疑模式: ', async (frame: Frame) => {
        try {
          const datasets = await frameParser.createDatasets(frame);
          successCount++;
          
          messageBridge.sendToWebview({
            type: MessageType.DataUpdate,
            payload: { datasets }
          });
        } catch (error) {
          errorCount++;
          
          messageBridge.sendToWebview({
            type: MessageType.ParseError,
            payload: { error: error.message, frameId: frame.id }
          });
        }
      });
      
      // 混合正常和错误数据
      const testData = Buffer.from('
- **文件**: tests/integration/DataFlow.test.ts
- **行号**: 177
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/DataFlow.test.ts 第 223 行发现可疑模式: ', async (frame: Frame) => {
        const datasets = await frameParser.createDatasets(frame);
        processedFrames++;
        
        // 模拟发送到webview的延迟
        messageBridge.sendToWebview({
          type: MessageType.DataUpdate,
          payload: { datasets }
        });
      });
      
      // 生成高频数据
      const interval = setInterval(() => {
        const data = Buffer.from(`${Math.random()},${Math.random()}\n`);
        frameReader.processData(data);
        
        if (Date.now() - startTime >= testDuration) {
          clearInterval(interval);
        }
      }, 1);
      
      // 等待测试完成
      await new Promise(resolve => setTimeout(resolve, testDuration + 100));
      
      expect(processedFrames).toBeGreaterThan(expectedFrames * 0.9); // 允许10%的性能损失
    });

    it('
- **文件**: tests/integration/DataFlow.test.ts
- **行号**: 223
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/DataFlow.test.ts 第 262 行发现可疑模式: ', async (frame: Frame) => {
        const datasets = await frameParser.createDatasets(frame);
        processedCount++;
        
        messageBridge.sendToWebview({
          type: MessageType.DataUpdate,
          payload: { datasets }
        });
      });
      
      // 处理大量数据
      for (let i = 0; i < largeDatasetCount; i++) {
        const data = Buffer.from(`${i}\n`);
        frameReader.processData(data);
        
        // 每1000帧检查一次内存使用
        if (i % 1000 === 0 && typeof process !== '
- **文件**: tests/integration/DataFlow.test.ts
- **行号**: 262
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/DataFlow.test.ts 第 349 行发现可疑模式: ', async (frame: Frame) => {
        try {
          const datasets = await frameParser.createDatasets(frame);
          messageBridge.sendToWebview({
            type: MessageType.DataUpdate,
            payload: { datasets }
          });
        } catch (error) {
          communicationErrors++;
          
          // 实现重试逻辑
          setTimeout(() => {
            // 恢复通信
            messageBridge.sendToWebview = originalSendToWebview;
          }, 100);
        }
      });
      
      const testData = Buffer.from('
- **文件**: tests/integration/DataFlow.test.ts
- **行号**: 349
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/DataFlow.test.ts 第 425 行发现可疑模式: ', () => frameCount++);
      
      const data1 = Buffer.from('
- **文件**: tests/integration/DataFlow.test.ts
- **行号**: 425
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 20 行发现可疑模式: ${testDuration.toFixed(2)}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 20
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 37 行发现可疑模式: ${originalData.length}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 37
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 44 行发现可疑模式: ${compressionTime.toFixed(2)}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 44
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 44 行发现可疑模式: ${compressed.compressionRatio.toFixed(2)}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 44
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 58 行发现可疑模式: ${cacheTime.toFixed(2)}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 58
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 66 行发现可疑模式: ${retrievalTime.toFixed(2)}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 66
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 75 行发现可疑模式: ${totalTime.toFixed(2)}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 75
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 82 行发现可疑模式: ${(renderRatio * 100).toFixed(1)}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 82
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 112 行发现可疑模式: ${i}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 112
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 115 行发现可疑模式: ${i}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 115
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 130 行发现可疑模式: ${results.length}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 130
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 130 行发现可疑模式: ${concurrentTime.toFixed(2)}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 130
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 131 行发现可疑模式: ${(concurrentTime / results.length).toFixed(2)}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 131
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 136 行发现可疑模式: ${result.taskId}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 136
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 137 行发现可疑模式: ${result.taskId}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 137
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 144 行发现可疑模式: ${cacheStats.size}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 144
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 144 行发现可疑模式: ${(cacheStats.memoryUsage / 1024 / 1024).toFixed(2)}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 144
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 177 行发现可疑模式: ${i}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 177
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 189 行发现可疑模式: ${metrics.memoryUsage.toFixed(2)}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 189
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 190 行发现可疑模式: ${metrics.cpuUsage.toFixed(1)}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 190
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 191 行发现可疑模式: ${cacheStats.size}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 191
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 192 行发现可疑模式: ${(cacheStats.memoryUsage / 1024 / 1024).toFixed(2)}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 192
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 204 行发现可疑模式: ${(initialMemory / 1024 / 1024).toFixed(2)}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 204
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 204 行发现可疑模式: ${(clearedStats.memoryUsage / 1024 / 1024).toFixed(2)}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 204
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 229 行发现可疑模式: ${i}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 229
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 242 行发现可疑模式: ${addedCount}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 242
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 243 行发现可疑模式: ${finalStats.size}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 243
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 244 行发现可疑模式: ${(finalStats.memoryUsage / 1024 / 1024).toFixed(2)}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 244
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 245 行发现可疑模式: ${finalStats.evictedEntries}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 245
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 246 行发现可疑模式: ${(endTime - startTime).toFixed(2)}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 246
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 272 行发现可疑模式: ${scenario.name}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 272
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 273 行发现可疑模式: ${scenario.dataPoints}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 273
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 274 行发现可疑模式: ${scenario.updateFrequency}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 274
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 305 行发现可疑模式: ${batch}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 305
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 309 行发现可疑模式: ${batch - 1}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 309
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 333 行发现可疑模式: ${batches}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 333
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 334 行发现可疑模式: ${avgProcessingTime.toFixed(2)}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 334
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 335 行发现可疑模式: ${maxProcessingTime.toFixed(2)}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 335
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 336 行发现可疑模式: ${avgCompressionRatio.toFixed(2)}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 336
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 337 行发现可疑模式: ${cacheStats.size}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 337
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 347 行发现可疑模式: ${targetFrameTime}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 347
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 347 行发现可疑模式: ${scenario.updateFrequency}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 347
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 391 行发现可疑模式: ${info.implemented ? '✅' : '❌'}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 391
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 391 行发现可疑模式: ${name}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 391
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 392 行发现可疑模式: ${info.file}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 392
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 393 行发现可疑模式: ${info.features.join(', ')}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 393
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 398 行发现可疑模式: ${info.status}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 398
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 398 行发现可疑模式: ${metric}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 398
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 398 行发现可疑模式: ${info.achieved}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 398
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 398 行发现可疑模式: ${info.target}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 398
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 419 行发现可疑模式: ${completionRate.toFixed(1)}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 419
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 419 行发现可疑模式: ${implementedCount}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 419
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 419 行发现可疑模式: ${totalCount}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 419
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 420 行发现可疑模式: ${targetAchievementRate.toFixed(1)}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 420
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 420 行发现可疑模式: ${metTargetCount}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 420
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 420 行发现可疑模式: ${totalTargetCount}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 420
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 421 行发现可疑模式: ${((completionRate + targetAchievementRate) / 2).toFixed(1)}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 421
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 466 行发现可疑模式: ${key}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 466
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 466 行发现可疑模式: ${value}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 466
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 471 行发现可疑模式: ${achievement}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 471
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 476 行发现可疑模式: ${highlight}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 476
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 481 行发现可疑模式: ${advantage}
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 481
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 28 行发现可疑模式: ');
      
      // 1. 创建测试数据
      const originalData = Array.from({ length: 5000 }, (_, i) => ({
        timestamp: Date.now() + i * 100,
        value: Math.round(Math.sin(i * 0.01) * 100),
        sequence: i
      }));
      
      console.log(`   - 生成测试数据: ${originalData.length}项`);
      
      // 2. 数据压缩阶段
      const compressionStart = performance.now();
      const compressed = DataCompressor.compressAuto(originalData);
      const compressionTime = performance.now() - compressionStart;
      
      console.log(`   - 压缩完成: ${compressionTime.toFixed(2)}ms, 压缩比: ${compressed.compressionRatio.toFixed(2)}:1`);
      
      // 3. 缓存存储阶段
      const cache = new DataCache({
        maxSize: 10000,
        enableStats: true,
        enableLRU: true
      });
      
      const cacheStart = performance.now();
      cache.set('
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 28
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 71 行发现可疑模式: ').toBe(originalData[100].value);
      
      // 6. 性能验证
      const totalTime = compressionTime + cacheTime + retrievalTime;
      console.log(`   - 总处理时间: ${totalTime.toFixed(2)}ms`);
      expect(totalTime, '
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 71
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 92 行发现可疑模式: ');
      
      const cache = new DataCache({
        maxSize: 20000,
        enableStats: true
      });
      
      // 创建多个并发任务
      const concurrentTasks = Array.from({ length: 10 }, async (_, i) => {
        const taskData = Array.from({ length: 1000 }, (_, j) => ({
          timestamp: Date.now() + j * 10,
          value: Math.round(Math.cos(j * 0.01 + i) * 50),
          sequence: j,
          taskId: i
        }));
        
        // 压缩
        const compressed = DataCompressor.compressAuto(taskData);
        
        // 缓存
        cache.set(`task_${i}`, compressed, 30000);
        
        // 检索和解压
        const retrieved = cache.get(`task_${i}`);
        const decompressed = DataCompressor.decompress(retrieved);
        
        return {
          taskId: i,
          originalSize: taskData.length,
          decompressedSize: decompressed.length,
          compressionRatio: compressed.compressionRatio
        };
      });
      
      const concurrentStart = performance.now();
      const results = await Promise.all(concurrentTasks);
      const concurrentTime = performance.now() - concurrentStart;
      
      console.log(`   - 并发处理${results.length}个任务: ${concurrentTime.toFixed(2)}ms`);
      console.log(`   - 平均每任务: ${(concurrentTime / results.length).toFixed(2)}ms`);
      
      // 验证所有任务都成功完成
      expect(results.length, '
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 92
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 174 行发现可疑模式: ');
      for (let i = 0; i < 1000; i++) {
        const data = Array.from({ length: 50 }, () => Math.random());
        cache.set(`load_test_${i}`, data, 5000);
        
        if (i % 100 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1));
        }
      }
      
      // 获取性能指标
      const metrics = monitor.getCurrentMetrics();
      const cacheStats = cache.getStats();
      
      console.log(`   - 性能指标:`);
      console.log(`     * 内存使用: ${metrics.memoryUsage.toFixed(2)}MB`);
      console.log(`     * CPU使用: ${metrics.cpuUsage.toFixed(1)}%`);
      console.log(`     * 缓存大小: ${cacheStats.size}项`);
      console.log(`     * 缓存内存: ${(cacheStats.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
      
      // 验证监控功能
      expect(metrics.memoryUsage, '
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 174
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 214 行发现可疑模式: ');
      
      const cache = new DataCache({
        maxSize: 100,
        maxMemory: 1024 * 1024, // 1MB
        enableLRU: true,
        enableStats: true
      });
      
      let addedCount = 0;
      const startTime = performance.now();
      
      // 添加大量数据直到触发清理
      for (let i = 0; i < 500; i++) {
        const largeData = Array.from({ length: 1000 }, () => Math.random());
        cache.set(`pressure_test_${i}`, largeData, 10000);
        addedCount++;
        
        const stats = cache.getStats();
        if (stats.size >= 100) {
          // 已触发LRU清理
          break;
        }
      }
      
      const endTime = performance.now();
      const finalStats = cache.getStats();
      
      console.log(`   - 添加数据: ${addedCount}项`);
      console.log(`   - 最终缓存大小: ${finalStats.size}项`);
      console.log(`   - 内存使用: ${(finalStats.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
      console.log(`   - 淘汰项数: ${finalStats.evictedEntries}`);
      console.log(`   - 处理时间: ${(endTime - startTime).toFixed(2)}ms`);
      
      // 验证LRU机制
      expect(finalStats.size, '
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 214
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 266 行发现可疑模式: ',
        dataPoints: 10000,
        updateFrequency: 20, // 20Hz
        duration: 1000 // 1秒
      };
      
      console.log(`   - 场景: ${scenario.name}`);
      console.log(`   - 数据点: ${scenario.dataPoints}`);
      console.log(`   - 更新频率: ${scenario.updateFrequency}Hz`);
      
      const cache = new DataCache({
        maxSize: 50000,
        enableStats: true,
        enableLRU: true
      });
      
      const processingTimes: number[] = [];
      const compressionRatios: number[] = [];
      
      // 模拟实时数据流处理
      const batchSize = Math.floor(scenario.dataPoints / scenario.updateFrequency);
      const batches = Math.floor(scenario.dataPoints / batchSize);
      
      for (let batch = 0; batch < batches; batch++) {
        const batchStart = performance.now();
        
        // 1. 生成数据批次
        const batchData = Array.from({ length: batchSize }, (_, i) => ({
          timestamp: Date.now() + batch * 1000 + i * 10,
          value: Math.round(Math.sin((batch * batchSize + i) * 0.01) * 100),
          sequence: batch * batchSize + i,
          batch
        }));
        
        // 2. 压缩数据
        const compressed = DataCompressor.compressAuto(batchData);
        compressionRatios.push(compressed.compressionRatio);
        
        // 3. 缓存数据
        cache.set(`batch_${batch}`, compressed, 5000);
        
        // 4. 模拟虚拟化渲染（只处理最近的数据）
        if (batch >= 2) {
          const recentCompressed = cache.get(`batch_${batch - 1}`);
          if (recentCompressed) {
            const recentData = DataCompressor.decompress(recentCompressed);
            // 虚拟化只渲染前10个点
            const visibleData = recentData.slice(0, 10);
            expect(visibleData.length, '
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 266
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 314 行发现可疑模式: ').toBeLessThanOrEqual(10);
          }
        }
        
        const batchTime = performance.now() - batchStart;
        processingTimes.push(batchTime);
        
        // 模拟更新间隔
        if (batch < batches - 1) {
          await new Promise(resolve => setTimeout(resolve, 1));
        }
      }
      
      // 统计结果
      const avgProcessingTime = processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length;
      const avgCompressionRatio = compressionRatios.reduce((sum, ratio) => sum + ratio, 0) / compressionRatios.length;
      const maxProcessingTime = Math.max(...processingTimes);
      const cacheStats = cache.getStats();
      
      console.log(`   - 处理批次: ${batches}`);
      console.log(`   - 平均处理时间: ${avgProcessingTime.toFixed(2)}ms`);
      console.log(`   - 最大处理时间: ${maxProcessingTime.toFixed(2)}ms`);
      console.log(`   - 平均压缩比: ${avgCompressionRatio.toFixed(2)}:1`);
      console.log(`   - 缓存命中统计: ${cacheStats.size}项`);
      
      // 验证性能指标
      expect(avgProcessingTime, '
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 314
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 414 行发现可疑模式: ').length;
      const totalTargetCount = Object.values(performanceTargets).length;
      const targetAchievementRate = (metTargetCount / totalTargetCount) * 100;
      
      console.log(`   📈 整体评估:`);
      console.log(`      功能完成度: ${completionRate.toFixed(1)}% (${implementedCount}/${totalCount})`);
      console.log(`      性能达成度: ${targetAchievementRate.toFixed(1)}% (${metTargetCount}/${totalTargetCount})`);
      console.log(`      综合评分: ${((completionRate + targetAchievementRate) / 2).toFixed(1)}%`);
      
      expect(completionRate, '
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 414
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 435 行发现可疑模式: 'A+ (优秀)'
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 435
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 439 行发现可疑模式: '✅ 完善数据压缩系统 - 支持Delta+RLE压缩算法'
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 439
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 440 行发现可疑模式: '✅ 实现智能缓存策略 - LRU淘汰+TTL+内存限制'
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 440
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 441 行发现可疑模式: '✅ 集成性能监控系统 - 实时监控+基准测试'
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 441
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/io/BluetoothLEDriver.test.ts 第 221 行发现可疑模式: ');
        deviceCount++;
      });
      
      driver.startDiscovery().then(() => {
        expect(deviceCount).toBeGreaterThan(0);
        done();
      });
    });

    it('
- **文件**: tests/io/BluetoothLEDriver.test.ts
- **行号**: 221
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/io/Manager.test.ts 第 13 行发现可疑模式: ${config.port}
- **文件**: tests/io/Manager.test.ts
- **行号**: 13
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/parsing/CircularBuffer.test.ts 第 61 行发现可疑模式: ');
      
      buffer.write(data);
      
      const positions = [];
      let pos = buffer.findPattern(delimiter);
      while (pos !== -1) {
        positions.push(pos);
        // 移动到下一个位置继续搜索
        buffer.read(pos + delimiter.length);
        pos = buffer.findPattern(delimiter);
      }
      
      expect(positions).toEqual([5, 11, 16]);
    });

    it('
- **文件**: tests/parsing/CircularBuffer.test.ts
- **行号**: 61
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/parsing/CircularBuffer.test.ts 第 79 行发现可疑模式: ');
      
      buffer.write(data);
      
      const firstPos = buffer.findPattern(pattern);
      expect(firstPos).toBe(0);
      
      // 跳过第一个匹配，查找下一个
      buffer.read(firstPos + pattern.length + 3); // 跳过 "
- **文件**: tests/parsing/CircularBuffer.test.ts
- **行号**: 79
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/parsing/CircularBuffer.test.ts 第 138 行发现可疑模式: ');
      const iterations = 1000;
      
      const startTime = process.hrtime.bigint();
      
      for (let i = 0; i < iterations; i++) {
        buffer.write(testData);
        buffer.read(testData.length);
      }
      
      const endTime = process.hrtime.bigint();
      const executionTime = Number(endTime - startTime) / 1000000;
      
      expect(buffer.size).toBe(0);
      expect(executionTime).toBeLessThan(50); // 1000次操作应该在50ms内完成
    });
  });

  describe('
- **文件**: tests/parsing/CircularBuffer.test.ts
- **行号**: 138
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/parsing/CircularBuffer.test.ts 第 187 行发现可疑模式: ');
      
      // 多次写入和读取相同大小的数据
      for (let i = 0; i < 100; i++) {
        buffer.write(testData);
        buffer.read(testData.length);
      }
      
      expect(buffer.size).toBe(0);
      // 内存使用应该保持稳定，没有泄漏
    });

    it('
- **文件**: tests/parsing/CircularBuffer.test.ts
- **行号**: 187
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/parsing/CircularBuffer.test.ts 第 200 行发现可疑模式: ');
      
      // 模拟串口数据的字节级接收
      for (let i = 0; i < 1000; i++) {
        buffer.write(smallChunk);
      }
      
      expect(buffer.size).toBe(1000);
      
      const result = buffer.read(1000);
      expect(result.length).toBe(1000);
      expect(result[0]).toBe(0x58); // '
- **文件**: tests/parsing/CircularBuffer.test.ts
- **行号**: 200
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/parsing/FrameParser.test.ts 第 420 行发现可疑模式: ${i}
- **文件**: tests/parsing/FrameParser.test.ts
- **行号**: 420
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/parsing/FrameParser.test.ts 第 351 行发现可疑模式: ',
        timestamp: Date.now(),
        checksumValid: true
      };
      
      const iterations = 1000;
      const startTime = process.hrtime.bigint();
      
      for (let i = 0; i < iterations; i++) {
        await parser.parseFrame(frame);
      }
      
      const endTime = process.hrtime.bigint();
      const executionTime = Number(endTime - startTime) / 1000000; // 毫秒
      
      expect(executionTime).toBeLessThan(100); // 1000次解析应该在100ms内完成
    });

    it('
- **文件**: tests/parsing/FrameParser.test.ts
- **行号**: 351
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/parsing/FrameParser.test.ts 第 373 行发现可疑模式: ');
          for (let i = 0; i < parts.length; i++) {
            values.push(parseFloat(parts[i]));
          }
          return values;
        }
      `;
      
      parser.loadScript(parseCode);
      
      // 生成1000个数值的字符串
      const largeData = Array.from({ length: 1000 }, (_, i) => i.toString()).join('
- **文件**: tests/parsing/FrameParser.test.ts
- **行号**: 373
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/parsing/FrameParser.test.ts 第 407 行发现可疑模式: ', () => {
      const parseCode = `
        function parse(frame) {
          return [1, 2, 3];
        }
      `;
      
      parser.loadScript(parseCode);
      
      // 模拟多次加载不同脚本
      for (let i = 0; i < 10; i++) {
        const newCode = `
          function parse(frame) {
            return [${i}];
          }
        `;
        parser.loadScript(newCode);
      }
      
      // 应该没有内存泄漏
      expect(parser.isReady()).toBe(true);
    });

    it('
- **文件**: tests/parsing/FrameParser.test.ts
- **行号**: 407
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/parsing/FrameReader.test.ts 第 277 行发现可疑模式: ${index + 1}
- **文件**: tests/parsing/FrameReader.test.ts
- **行号**: 277
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/parsing/FrameReader.test.ts 第 301 行发现可疑模式: ${i}
- **文件**: tests/parsing/FrameReader.test.ts
- **行号**: 301
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/parsing/FrameReader.test.ts 第 272 行发现可疑模式: ', (frame) => frames.push(frame));
      frameReader.processData(testData);
      
      expect(frames).toHaveLength(4);
      frames.forEach((frame, index) => {
        expect(frame.data.toString()).toBe(`Frame${index + 1}`);
      });
    });

    it('
- **文件**: tests/parsing/FrameReader.test.ts
- **行号**: 272
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/parsing/FrameReader.test.ts 第 282 行发现可疑模式: '.repeat(10000) + '
- **文件**: tests/parsing/FrameReader.test.ts
- **行号**: 282
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/parsing/FrameReader.test.ts 第 289 行发现可疑模式: ', (warning) => warnings.push(warning));
      
      frameReader.processData(testData);
      
      // 应该正确处理大帧或发出溢出警告
      expect(frames.length + warnings.length).toBeGreaterThan(0);
    });
  });

  describe('
- **文件**: tests/parsing/FrameReader.test.ts
- **行号**: 289
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/parsing/FrameReader.test.ts 第 322 行发现可疑模式: ', () => processedFrames++);
      
      const startTime = process.hrtime.bigint();
      
      // 模拟实时数据流
      for (let i = 0; i < frameCount; i++) {
        const frame = '
- **文件**: tests/parsing/FrameReader.test.ts
- **行号**: 322
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/parsing/FrameReader.test.ts 第 328 行发现可疑模式: '.repeat(frameSize) + '
- **文件**: tests/parsing/FrameReader.test.ts
- **行号**: 328
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 49 行发现可疑模式: ${Math.random()}
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 49
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 64 行发现可疑模式: ${actualFrequency.toFixed(1)}
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 64
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 97 行发现可疑模式: ${i}
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 97
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 109 行发现可疑模式: ${maxLatency}
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 109
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 109 行发现可疑模式: ${avgLatency.toFixed(2)}
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 109
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 140 行发现可疑模式: ${i}
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 140
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 157 行发现可疑模式: ${actualThroughput.toFixed(0)}
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 157
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 197 行发现可疑模式: ${dataPoints}
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 197
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 197 行发现可疑模式: ${maxUpdateTime.toFixed(2)}
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 197
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 197 行发现可疑模式: ${avgUpdateTime.toFixed(2)}
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 197
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 226 行发现可疑模式: ${maxDataPoints}
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 226
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 226 行发现可疑模式: ${processingTime.toFixed(2)}
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 226
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 245 行发现可疑模式: ${i}
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 245
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 245 行发现可疑模式: ${j}
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 245
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 261 行发现可疑模式: ${i}
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 261
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 261 行发现可疑模式: ${(memoryIncrease / 1024 / 1024).toFixed(2)}
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 261
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 271 行发现可疑模式: ${(totalMemoryUsed / 1024 / 1024).toFixed(2)}
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 271
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 286 行发现可疑模式: ${totalSamples.toLocaleString()}
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 286
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 287 行发现可疑模式: ${estimatedMemoryMB.toFixed(2)}
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 287
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 307 行发现可疑模式: ${i}
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 307
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 321 行发现可疑模式: ${i + 1}
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 321
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 346 行发现可疑模式: ${index}
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 346
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 346 行发现可疑模式: ${i}
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 346
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 361 行发现可疑模式: ${maxConcurrentConnections}
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 361
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 361 行发现可疑模式: ${processingTime}
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 361
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 373 行发现可疑模式: ${(mockBundleSize / 1024 / 1024).toFixed(2)}
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 373
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 407 行发现可疑模式: ${loadTime}
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 407
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 424 行发现可疑模式: ${i}
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 424
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 432 行发现可疑模式: ${i}
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 432
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 433 行发现可疑模式: ${i}
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 433
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 434 行发现可疑模式: ${i}
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 434
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 450 行发现可疑模式: ${i}
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 450
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 450 行发现可疑模式: ${memoryGrowthMB.toFixed(2)}
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 450
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 465 行发现可疑模式: ${finalMemoryGrowth.toFixed(2)}
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 465
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 40 行发现可疑模式: ', async (frame) => {
        await frameParser.createDatasets(frame);
        processedFrames++;
      });

      const startTime = Date.now();
      
      // 模拟高频数据输入
      const interval = setInterval(() => {
        const data = Buffer.from(`${Math.random()}\n`);
        frameReader.processData(data);
        
        if (Date.now() - startTime >= testDuration) {
          clearInterval(interval);
        }
      }, 1000 / (targetFrequency * 2)); // 发送频率是目标频率的2倍

      await new Promise(resolve => setTimeout(resolve, testDuration + 100));

      expect(processedFrames).toBeGreaterThanOrEqual(minExpectedFrames);
      
      const actualFrequency = processedFrames / (testDuration / 1000);
      expect(actualFrequency).toBeGreaterThanOrEqual(20);
      
      console.log(`实际处理频率: ${actualFrequency.toFixed(1)} Hz (要求: ≥20Hz)`);
    });

    it('
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 40
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 85 行发现可疑模式: ', async (frame) => {
        const processingStart = Date.now();
        
        await frameParser.createDatasets(frame);
        
        const processingEnd = Date.now();
        const latency = processingEnd - processingStart;
        latencies.push(latency);
      });

      // 测试100个帧的处理延迟
      for (let i = 0; i < 100; i++) {
        const data = Buffer.from(`${i}\n`);
        frameReader.processData(data);
      }

      expect(latencies).toHaveLength(100);
      
      const maxLatency = Math.max(...latencies);
      const avgLatency = latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length;
      
      expect(maxLatency).toBeLessThanOrEqual(maxAllowedLatency);
      expect(avgLatency).toBeLessThan(maxAllowedLatency / 2);
      
      console.log(`最大延迟: ${maxLatency}ms, 平均延迟: ${avgLatency.toFixed(2)}ms (要求: ≤50ms)`);
    });

    it('
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 85
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 132 行发现可疑模式: ', async (frame) => {
        await frameParser.createDatasets(frame);
        processedFrames++;
      });

      // 准备大量测试数据
      const testData = Buffer.concat(
        Array.from({ length: testFrameCount }, (_, i) => 
          Buffer.from(`${i}\n`)
        )
      );

      const startTime = process.hrtime.bigint();
      
      // 批量处理数据
      frameReader.processData(testData);
      
      const endTime = process.hrtime.bigint();
      const processingTimeMs = Number(endTime - startTime) / 1000000;
      
      const actualThroughput = (processedFrames / processingTimeMs) * 1000;
      
      expect(processedFrames).toBe(testFrameCount);
      expect(actualThroughput).toBeGreaterThanOrEqual(targetThroughput);
      
      console.log(`实际吞吐量: ${actualThroughput.toFixed(0)} frames/s (要求: ≥10000 frames/s)`);
    });
  });

  describe('
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 132
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 162 行发现可疑模式: ', async () => {
      // 模拟Chart.js图表更新性能
      const simulateChartUpdate = async (dataPoints: number) => {
        const startTime = process.hrtime.bigint();
        
        // 模拟图表数据处理和渲染
        const data = Array.from({ length: dataPoints }, (_, i) => ({
          x: i,
          y: Math.sin(i * 0.1) * 100
        }));
        
        // 模拟DOM操作延迟
        await new Promise(resolve => setTimeout(resolve, Math.random() * 5));
        
        const endTime = process.hrtime.bigint();
        return Number(endTime - startTime) / 1000000; // 转换为毫秒
      };

      const maxAllowedUpdateTime = 16; // ms (60fps要求)
      const testCases = [100, 500, 1000, 2000, 5000]; // 不同数据点数量
      
      for (const dataPoints of testCases) {
        const updateTimes: number[] = [];
        
        // 测试10次更新
        for (let i = 0; i < 10; i++) {
          const updateTime = await simulateChartUpdate(dataPoints);
          updateTimes.push(updateTime);
        }
        
        const maxUpdateTime = Math.max(...updateTimes);
        const avgUpdateTime = updateTimes.reduce((sum, time) => sum + time, 0) / updateTimes.length;
        
        expect(maxUpdateTime).toBeLessThanOrEqual(maxAllowedUpdateTime);
        
        console.log(`${dataPoints}数据点 - 最大更新时间: ${maxUpdateTime.toFixed(2)}ms, 平均: ${avgUpdateTime.toFixed(2)}ms`);
      }
    });

    it('
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 162
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 201 行发现可疑模式: ', () => {
      const buffer = new CircularBuffer(1024 * 1024); // 1MB缓冲区
      const maxDataPoints = 100000;
      
      // 生成大量数据点
      const largeDataset = Array.from({ length: maxDataPoints }, (_, i) => {
        const timestamp = Date.now() + i * 100;
        const value = Math.sin(i * 0.01) * 100 + Math.random() * 10;
        return { timestamp, value };
      });
      
      const startTime = process.hrtime.bigint();
      
      // 模拟数据处理
      const processedData = largeDataset.map(point => ({
        x: point.timestamp,
        y: point.value
      }));
      
      const endTime = process.hrtime.bigint();
      const processingTime = Number(endTime - startTime) / 1000000;
      
      expect(processedData).toHaveLength(maxDataPoints);
      expect(processingTime).toBeLessThan(100); // 处理10万数据点应该在100ms内完成
      
      console.log(`处理${maxDataPoints}数据点耗时: ${processingTime.toFixed(2)}ms`);
    });

    it('
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 201
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 232 行发现可疑模式: ');
        return;
      }

      const initialMemory = process.memoryUsage();
      const memoryLimit = 500 * 1024 * 1024; // 500MB
      
      // 创建大量测试数据
      const testDataSets = [];
      const iterations = 1000;
      
      for (let i = 0; i < iterations; i++) {
        const dataset = Array.from({ length: 1000 }, (_, j) => ({
          id: `frame_${i}_${j}`,
          timestamp: Date.now() + j,
          value: Math.random() * 100,
          processed: true
        }));
        
        testDataSets.push(dataset);
        
        // 每100次迭代检查内存使用
        if (i % 100 === 0) {
          const currentMemory = process.memoryUsage();
          const memoryIncrease = currentMemory.heapUsed - initialMemory.heapUsed;
          
          expect(currentMemory.heapUsed).toBeLessThan(memoryLimit);
          
          if (i > 0) {
            console.log(`迭代${i}: 内存增长 ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
          }
        }
      }
      
      const finalMemory = process.memoryUsage();
      const totalMemoryUsed = finalMemory.heapUsed;
      
      expect(totalMemoryUsed).toBeLessThan(memoryLimit);
      
      console.log(`最终内存使用: ${(totalMemoryUsed / 1024 / 1024).toFixed(2)}MB (限制: 500MB)`);
    });
  });

  describe('
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 232
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 276 行发现可疑模式: ', () => {
      const hoursToTest = 24;
      const samplesPerSecond = 10;
      const totalSamples = hoursToTest * 3600 * samplesPerSecond;
      
      // 估算内存使用（每个样本假设占用64字节）
      const bytesPerSample = 64;
      const estimatedMemoryMB = (totalSamples * bytesPerSample) / (1024 * 1024);
      
      console.log(`24小时数据保留测试:`);
      console.log(`- 总样本数: ${totalSamples.toLocaleString()}`);
      console.log(`- 估算内存使用: ${estimatedMemoryMB.toFixed(2)}MB`);
      
      // 验证内存使用在合理范围内（不超过1GB）
      expect(estimatedMemoryMB).toBeLessThan(1024);
      
      // 模拟时间跨度计算
      const startTime = Date.now();
      const endTime = startTime + (hoursToTest * 3600 * 1000);
      const timeSpan = endTime - startTime;
      
      expect(timeSpan).toBeGreaterThanOrEqual(24 * 3600 * 1000);
    });

    it('
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 276
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 300 行发现可疑模式: ', async () => {
      const maxConcurrentConnections = 10;
      const connections: any[] = [];
      
      // 模拟创建多个并发连接
      for (let i = 0; i < maxConcurrentConnections; i++) {
        const connection = {
          id: `conn_${i}`,
          frameReader: new FrameReader({
            frameDetection: FrameDetection.EndDelimiterOnly,
            finishSequence: new Uint8Array([0x0A]),
            decoderMethod: DecoderMethod.PlainText,
            checksumAlgorithm: ChecksumAlgorithm.None
          }),
          frameParser: new FrameParser(),
          buffer: new CircularBuffer(8192),
          isActive: true
        };
        
        connection.frameParser.loadScript(`
          function parse(frame) {
            return [parseFloat(frame) * ${i + 1}];
          }
        `);
        
        connections.push(connection);
      }
      
      expect(connections).toHaveLength(maxConcurrentConnections);
      
      // 测试所有连接同时处理数据
      const testPromises = connections.map(async (conn, index) => {
        return new Promise<void>((resolve) => {
          let processedFrames = 0;
          
          conn.frameReader.on('
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 300
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 335 行发现可疑模式: ', async (frame: any) => {
            await conn.frameParser.createDatasets(frame);
            processedFrames++;
            
            if (processedFrames >= 10) {
              resolve();
            }
          });
          
          // 向每个连接发送测试数据
          for (let i = 0; i < 10; i++) {
            const data = Buffer.from(`${index}_${i}\n`);
            conn.frameReader.processData(data);
          }
        });
      });
      
      const startTime = Date.now();
      await Promise.all(testPromises);
      const endTime = Date.now();
      
      const processingTime = endTime - startTime;
      
      // 所有连接应该能在合理时间内完成处理
      expect(processingTime).toBeLessThan(1000); // 1秒内完成
      
      console.log(`${maxConcurrentConnections}个并发连接处理完成耗时: ${processingTime}ms`);
    });
  });

  describe('
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 335
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 50 行发现可疑模式: ${testData.length.toLocaleString()}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 50
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 51 行发现可疑模式: ${(compressed.originalSize / 1024).toFixed(2)}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 51
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 52 行发现可疑模式: ${(compressed.compressedSize / 1024).toFixed(2)}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 52
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 53 行发现可疑模式: ${compressed.compressionRatio.toFixed(2)}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 53
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 54 行发现可疑模式: ${compressionTime.toFixed(2)}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 54
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 67 行发现可疑模式: ${decompressionTime.toFixed(2)}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 67
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 68 行发现可疑模式: ${decompressed.length === testData.length ? '✅' : '❌'}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 68
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 105 行发现可疑模式: ${datasets.length}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 105
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 106 行发现可疑模式: ${concurrentTime.toFixed(2)}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 106
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 107 行发现可疑模式: ${avgCompressionRatio.toFixed(2)}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 107
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 108 行发现可疑模式: ${(concurrentTime / datasets.length).toFixed(2)}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 108
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 137 行发现可疑模式: ${i}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 137
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 149 行发现可疑模式: ${statsBeforeRead.size}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 149
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 149 行发现可疑模式: ${statsBeforeRead.hits}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 149
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 149 行发现可疑模式: ${statsBeforeRead.misses}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 149
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 152 行发现可疑模式: ${i}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 152
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 162 行发现可疑模式: ${writeTime.toFixed(2)}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 162
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 163 行发现可疑模式: ${readTime.toFixed(2)}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 163
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 164 行发现可疑模式: ${(stats.hitRate * 100).toFixed(1)}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 164
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 165 行发现可疑模式: ${(stats.memoryUsage / 1024 / 1024).toFixed(2)}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 165
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 166 行发现可疑模式: ${stats.averageAccessTime.toFixed(3)}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 166
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 189 行发现可疑模式: ${i}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 189
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 190 行发现可疑模式: ${i}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 190
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 210 行发现可疑模式: ${setTime.toFixed(2)}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 210
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 211 行发现可疑模式: ${getTime.toFixed(2)}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 211
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 212 行发现可疑模式: ${results.size}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 212
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 213 行发现可疑模式: ${(1000 / setTime * 1000).toFixed(0)}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 213
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 214 行发现可疑模式: ${(1000 / getTime * 1000).toFixed(0)}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 214
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 237 行发现可疑模式: ${i}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 237
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 251 行发现可疑模式: ${beforeCleanup.size}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 251
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 252 行发现可疑模式: ${afterCleanup.size}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 252
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 253 行发现可疑模式: ${expiredCount}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 253
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 254 行发现可疑模式: ${(beforeCleanup.memoryUsage / 1024 / 1024).toFixed(2)}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 254
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 255 行发现可疑模式: ${(afterCleanup.memoryUsage / 1024 / 1024).toFixed(2)}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 255
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 272 行发现可疑模式: ${totalStartupTime.toFixed(2)}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 272
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 277 行发现可疑模式: ${mockStartupTime.toFixed(2)}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 277
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 278 行发现可疑模式: ${PERFORMANCE_TARGETS.startupTime}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 278
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 279 行发现可疑模式: ${mockStartupTime <= PERFORMANCE_TARGETS.startupTime ? '✅ 达标' : '❌ 未达标'}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 279
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 300 行发现可疑模式: ${component}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 300
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 300 行发现可疑模式: ${memory}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 300
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 302 行发现可疑模式: ${estimatedMemoryUsage}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 302
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 303 行发现可疑模式: ${PERFORMANCE_TARGETS.memoryUsage}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 303
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 304 行发现可疑模式: ${estimatedMemoryUsage <= PERFORMANCE_TARGETS.memoryUsage ? '✅ 达标' : '❌ 超标'}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 304
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 335 行发现可疑模式: ${iterations}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 335
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 335 行发现可疑模式: ${processingTime.toFixed(2)}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 335
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 336 行发现可疑模式: ${processingSpeed.toFixed(0)}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 336
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 337 行发现可疑模式: ${estimatedCpuUsage.toFixed(1)}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 337
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 338 行发现可疑模式: ${PERFORMANCE_TARGETS.cpuUsage}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 338
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 339 行发现可疑模式: ${estimatedCpuUsage <= PERFORMANCE_TARGETS.cpuUsage ? '✅ 达标' : '⚠️ 需优化'}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 339
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 369 行发现可疑模式: ${achievement}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 369
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 372 行发现可疑模式: ${metric}
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 372
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 31 行发现可疑模式: ');
      
      // 生成有规律的测试数据（更适合压缩）
      const baseTime = Date.now();
      const testData = Array.from({ length: 10000 }, (_, i) => ({
        timestamp: baseTime + i * 100, // 固定时间间隔
        value: Math.round(Math.sin(i * 0.01) * 100), // 去掉随机数，使用整数
        sequence: i
      }));
      
      const compressionStartTime = performance.now();
      
      // 执行压缩
      const compressed = DataCompressor.compressAuto(testData);
      
      const compressionEndTime = performance.now();
      const compressionTime = compressionEndTime - compressionStartTime;
      
      console.log(`📊 数据压缩性能:`);
      console.log(`   - 原始数据: ${testData.length.toLocaleString()}项`);
      console.log(`   - 原始大小: ${(compressed.originalSize / 1024).toFixed(2)}KB`);
      console.log(`   - 压缩大小: ${(compressed.compressedSize / 1024).toFixed(2)}KB`);
      console.log(`   - 压缩比: ${compressed.compressionRatio.toFixed(2)}:1`);
      console.log(`   - 压缩时间: ${compressionTime.toFixed(2)}ms`);
      
      // 验证压缩性能
      expect(compressionTime, '
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 31
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 79 行发现可疑模式: ');
      
      const baseTime = Date.now();
      const datasets = Array.from({ length: 5 }, (_, i) => 
        Array.from({ length: 2000 }, (_, j) => ({
          timestamp: baseTime + j * 50,
          value: Math.round(Math.cos(j * 0.02 + i) * 50), // 使用整数
          sequence: j
        }))
      );
      
      const concurrentStartTime = performance.now();
      
      // 并发压缩
      const compressionPromises = datasets.map(data => 
        Promise.resolve().then(() => DataCompressor.compressAuto(data))
      );
      
      const results = await Promise.all(compressionPromises);
      
      const concurrentEndTime = performance.now();
      const concurrentTime = concurrentEndTime - concurrentStartTime;
      
      const avgCompressionRatio = results.reduce((sum, r) => sum + r.compressionRatio, 0) / results.length;
      
      console.log(`📊 并发压缩性能:`);
      console.log(`   - 并发任务数: ${datasets.length}`);
      console.log(`   - 总处理时间: ${concurrentTime.toFixed(2)}ms`);
      console.log(`   - 平均压缩比: ${avgCompressionRatio.toFixed(2)}:1`);
      console.log(`   - 单任务平均时间: ${(concurrentTime / datasets.length).toFixed(2)}ms`);
      
      expect(concurrentTime, '
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 79
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 118 行发现可疑模式: ');
      
      const cache = new DataCache({
        maxSize: 10000,
        maxMemory: 50 * 1024 * 1024, // 50MB
        defaultTTL: 60000,
        enableLRU: true,
        enableStats: true
      });
      
      const cacheStartTime = performance.now();
      
      // 大量写入操作
      for (let i = 0; i < 10000; i++) {
        const data = {
          id: i,
          value: Math.random() * 1000,
          data: Array.from({ length: 100 }, () => Math.random())
        };
        cache.set(`key_${i}`, data, 60000, 50);
      }
      
      const writeEndTime = performance.now();
      const writeTime = writeEndTime - cacheStartTime;
      
      // 大量读取操作
      const readStartTime = performance.now();
      let hitCount = 0;
      
      // 先检查一下缓存状态
      const statsBeforeRead = cache.getStats();
      console.log(`   - 读取前统计: size=${statsBeforeRead.size}, hits=${statsBeforeRead.hits}, misses=${statsBeforeRead.misses}`);
      
      for (let i = 0; i < 10000; i++) {
        const result = cache.get(`key_${i}`);
        if (result) hitCount++;
      }
      
      const readEndTime = performance.now();
      const readTime = readEndTime - readStartTime;
      
      const stats = cache.getStats();
      
      console.log(`📊 缓存性能:`);
      console.log(`   - 写入10K项: ${writeTime.toFixed(2)}ms`);
      console.log(`   - 读取10K项: ${readTime.toFixed(2)}ms`);
      console.log(`   - 命中率: ${(stats.hitRate * 100).toFixed(1)}%`);
      console.log(`   - 内存使用: ${(stats.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
      console.log(`   - 平均访问时间: ${stats.averageAccessTime.toFixed(3)}ms`);
      
      // 验证缓存性能
      expect(writeTime, '
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 118
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 224 行发现可疑模式: ');
      
      const cache = new DataCache({
        maxSize: 1000,
        maxMemory: 5 * 1024 * 1024, // 5MB
        defaultTTL: 1000, // 1秒
        enableStats: true,
        enableLRU: true
      });
      
      // 填充缓存到容量上限
      for (let i = 0; i < 2000; i++) {
        const largeData = Array.from({ length: 500 }, () => Math.random());
        cache.set(`large_${i}`, largeData, 1000); // 1秒过期
      }
      
      const beforeCleanup = cache.getStats();
      
      // 等待数据过期
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 触发清理
      const expiredCount = cache.cleanup();
      
      const afterCleanup = cache.getStats();
      
      console.log(`📊 内存回收测试:`);
      console.log(`   - 清理前缓存大小: ${beforeCleanup.size}项`);
      console.log(`   - 清理后缓存大小: ${afterCleanup.size}项`);
      console.log(`   - 过期清理项数: ${expiredCount}`);
      console.log(`   - 清理前内存: ${(beforeCleanup.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
      console.log(`   - 清理后内存: ${(afterCleanup.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
      
      // 验证内存回收效果
      expect(expiredCount, '
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 224
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 267 行发现可疑模式: ', () => {
      const currentTime = performance.now();
      const totalStartupTime = currentTime - startTime;
      
      console.log(`📊 启动性能:`);
      console.log(`   - 测试初始化时间: ${totalStartupTime.toFixed(2)}ms`);
      
      // 模拟完整启动过程
      const mockStartupTime = totalStartupTime + 1000; // 加上模拟的组件加载时间
      
      console.log(`   - 估计完整启动时间: ${mockStartupTime.toFixed(2)}ms`);
      console.log(`   - 目标启动时间: ${PERFORMANCE_TARGETS.startupTime}ms`);
      console.log(`   - 性能状态: ${mockStartupTime <= PERFORMANCE_TARGETS.startupTime ? '
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 267
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 284 行发现可疑模式: ', () => {
      let estimatedMemoryUsage = 0;
      
      // 估算各组件内存使用
      const componentMemory = {
        dataCompression: 5,    // 5MB
        cacheSystem: 50,       // 50MB
        performanceMonitor: 2, // 2MB
        uiComponents: 20,      // 20MB
        extensionCore: 10      // 10MB
      };
      
      estimatedMemoryUsage = Object.values(componentMemory).reduce((sum, mem) => sum + mem, 0);
      
      console.log(`📊 内存使用估算:`);
      Object.entries(componentMemory).forEach(([component, memory]) => {
        console.log(`   - ${component}: ${memory}MB`);
      });
      console.log(`   - 总计估算: ${estimatedMemoryUsage}MB`);
      console.log(`   - 目标限制: ${PERFORMANCE_TARGETS.memoryUsage}MB`);
      console.log(`   - 状态: ${estimatedMemoryUsage <= PERFORMANCE_TARGETS.memoryUsage ? '
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 284
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 309 行发现可疑模式: ', async () => {
      const iterations = 1000;
      const startTime = performance.now();
      
      // 模拟CPU密集型操作
      let result = 0;
      for (let i = 0; i < iterations; i++) {
        // 模拟数据处理
        const data = Array.from({ length: 100 }, (_, j) => Math.sin(j * 0.1));
        result += data.reduce((sum, val) => sum + val, 0);
        
        // 避免阻塞太久
        if (i % 100 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1));
        }
      }
      
      const endTime = performance.now();
      const processingTime = endTime - startTime;
      const processingSpeed = iterations / (processingTime / 1000); // ops/s
      
      // 估算CPU使用率（基于处理速度）
      const targetSpeed = 10000; // 10K ops/s
      const estimatedCpuUsage = Math.min(100, (targetSpeed / processingSpeed) * 20); // 20%基准
      
      console.log(`📊 CPU使用效率:`);
      console.log(`   - 处理${iterations}次操作: ${processingTime.toFixed(2)}ms`);
      console.log(`   - 处理速度: ${processingSpeed.toFixed(0)} ops/s`);
      console.log(`   - 估算CPU使用: ${estimatedCpuUsage.toFixed(1)}%`);
      console.log(`   - 目标CPU限制: ${PERFORMANCE_TARGETS.cpuUsage}%`);
      console.log(`   - 状态: ${estimatedCpuUsage <= PERFORMANCE_TARGETS.cpuUsage ? '
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 309
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 357 行发现可疑模式: '
      ];
      
      const metrics = [
        `📈 数据压缩性能: ≥2:1压缩比, ≤100ms压缩时间`,
        `🚀 缓存系统性能: ≥95%命中率, <1ms平均访问时间`,
        `💾 内存使用优化: 智能回收机制, LRU淘汰策略`,
        `⚡ 启动性能优化: 异步加载, 懒初始化`,
        `🔄 实时性能监控: 20Hz+更新频率, <50ms延迟`
      ];
      
      console.log(`\n📊 主要成就:`);
      achievements.forEach(achievement => console.log(`   ${achievement}`));
      
      console.log(`\n📈 关键性能指标:`);
      metrics.forEach(metric => console.log(`   ${metric}`));
      
      console.log(`\n🏆 总体评估: 第32-33周性能优化目标全面达成`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      
      // 这个测试总是通过，用于展示成果
      expect(true, '
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 357
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 60 行发现可疑模式: ${startupTime.toFixed(2)}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 60
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 72 行发现可疑模式: ${metrics.memoryUsage.toFixed(2)}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 72
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 73 行发现可疑模式: ${metrics.cpuUsage.toFixed(1)}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 73
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 74 行发现可疑模式: ${metrics.updateFrequency.toFixed(1)}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 74
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 103 行发现可疑模式: ${largeDataset.value.length.toLocaleString()}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 103
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 104 行发现可疑模式: ${virtualList.visibleItems.value.length}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 104
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 105 行发现可疑模式: ${processingTime.toFixed(2)}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 105
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 106 行发现可疑模式: ${((virtualList.visibleItems.value.length / largeDataset.value.length) * 100).toFixed(2)}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 106
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 122 行发现可疑模式: ${i}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 122
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 146 行发现可疑模式: ${scrollTime.toFixed(2)}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 146
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 147 行发现可疑模式: ${(scrollTime / 100).toFixed(2)}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 147
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 172 行发现可疑模式: ${testData.length.toLocaleString()}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 172
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 173 行发现可疑模式: ${(compressed.originalSize / 1024).toFixed(2)}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 173
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 174 行发现可疑模式: ${(compressed.compressedSize / 1024).toFixed(2)}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 174
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 175 行发现可疑模式: ${compressed.compressionRatio.toFixed(2)}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 175
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 176 行发现可疑模式: ${compressionTime.toFixed(2)}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 176
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 188 行发现可疑模式: ${decompressionTime.toFixed(2)}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 188
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 220 行发现可疑模式: ${datasets.length}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 220
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 221 行发现可疑模式: ${concurrentTime.toFixed(2)}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 221
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 222 行发现可疑模式: ${(results.reduce((sum, r) => sum + r.compressionRatio, 0) / results.length).toFixed(2)}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 222
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 248 行发现可疑模式: ${i}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 248
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 259 行发现可疑模式: ${i}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 259
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 269 行发现可疑模式: ${writeTime.toFixed(2)}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 269
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 270 行发现可疑模式: ${readTime.toFixed(2)}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 270
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 271 行发现可疑模式: ${(stats.hitRate * 100).toFixed(1)}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 271
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 272 行发现可疑模式: ${(stats.memoryUsage / 1024 / 1024).toFixed(2)}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 272
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 273 行发现可疑模式: ${stats.averageAccessTime.toFixed(3)}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 273
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 293 行发现可疑模式: ${i}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 293
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 294 行发现可疑模式: ${i}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 294
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 314 行发现可疑模式: ${setTime.toFixed(2)}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 314
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 315 行发现可疑模式: ${getTime.toFixed(2)}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 315
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 316 行发现可疑模式: ${results.size}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 316
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 333 行发现可疑模式: ${benchmarkResult.results.filter(r => r.passed).length}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 333
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 333 行发现可疑模式: ${benchmarkResult.results.length}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 333
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 334 行发现可疑模式: ${benchmarkResult.passed ? '✅' : '❌'}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 334
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 339 行发现可疑模式: ${test}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 339
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 345 行发现可疑模式: ${result.testName}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 345
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 346 行发现可疑模式: ${result.operationsPerSecond.toFixed(0)}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 346
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 347 行发现可疑模式: ${result.averageTime.toFixed(3)}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 347
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 348 行发现可疑模式: ${result.memoryDelta.toFixed(2)}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 348
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 349 行发现可疑模式: ${result.passed ? '✅' : '❌'}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 349
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 362 行发现可疑模式: ${report.summary.monitoringDuration.toFixed(1)}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 362
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 363 行发现可疑模式: ${report.summary.totalSamples}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 363
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 364 行发现可疑模式: ${report.summary.benchmarksPassed}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 364
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 364 行发现可疑模式: ${report.summary.totalBenchmarks}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 364
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 365 行发现可疑模式: ${report.summary.overallHealth.toFixed(1)}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 365
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 370 行发现可疑模式: ${rec}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 370
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 386 行发现可疑模式: ${initialMetrics.memoryUsage.toFixed(2)}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 386
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 387 行发现可疑模式: ${initialMetrics.cpuUsage.toFixed(1)}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 387
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 417 行发现可疑模式: ${processingTime.toFixed(2)}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 417
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 418 行发现可疑模式: ${(iterations / (processingTime / 1000)).toFixed(0)}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 418
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 419 行发现可疑模式: ${memoryGrowth.toFixed(2)}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 419
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 420 行发现可疑模式: ${finalMetrics.memoryUsage.toFixed(2)}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 420
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 421 行发现可疑模式: ${finalMetrics.cpuUsage.toFixed(1)}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 421
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 442 行发现可疑模式: ${i}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 442
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 457 行发现可疑模式: ${initialMemory.toFixed(2)}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 457
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 458 行发现可疑模式: ${peakMemory.toFixed(2)}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 458
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 459 行发现可疑模式: ${finalMemory.toFixed(2)}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 459
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 460 行发现可疑模式: ${expiredCount}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 460
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 461 行发现可疑模式: ${cacheStats.size}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 461
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 462 行发现可疑模式: ${(cacheStats.memoryUsage / 1024 / 1024).toFixed(2)}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 462
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 488 行发现可疑模式: ${step.name}
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 488
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 83 行发现可疑模式: ', async () => {
      const testStartTime = performance.now();
      
      // 创建大数据集
      const largeDataset = ref(Array.from({ length: 100000 }, (_, i) => ({
        id: i,
        value: Math.random() * 100,
        timestamp: Date.now() + i
      })));
      
      const containerHeight = ref(600);
      const itemHeight = 25;
      
      // 使用虚拟化列表
      const virtualList = useVirtualList(largeDataset, itemHeight, containerHeight);
      
      const testEndTime = performance.now();
      const processingTime = testEndTime - testStartTime;
      
      console.log(`📊 虚拟化渲染性能:`);
      console.log(`   - 数据集大小: ${largeDataset.value.length.toLocaleString()}`);
      console.log(`   - 可见项目数: ${virtualList.visibleItems.value.length}`);
      console.log(`   - 处理时间: ${processingTime.toFixed(2)}ms`);
      console.log(`   - 渲染比例: ${((virtualList.visibleItems.value.length / largeDataset.value.length) * 100).toFixed(2)}%`);
      
      // 验证虚拟化效率
      expect(virtualList.visibleItems.value.length, '
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 83
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 118 行发现可疑模式: ', async () => {
      const largeDataset = ref(Array.from({ length: 50000 }, (_, i) => ({
        id: i,
        value: i,
        label: `Item ${i}`
      })));
      
      const containerHeight = ref(400);
      const virtualList = useVirtualList(largeDataset, 30, containerHeight);
      
      const scrollStartTime = performance.now();
      
      // 模拟快速滚动
      for (let i = 0; i < 100; i++) {
        const scrollPosition = (i / 100) * largeDataset.value.length * 30;
        virtualList.setScrollTop(scrollPosition);
        
        // 验证每次滚动后的状态
        expect(virtualList.visibleItems.value.length).toBeGreaterThan(0);
        expect(virtualList.startIndex.value).toBeGreaterThanOrEqual(0);
        expect(virtualList.endIndex.value).toBeLessThanOrEqual(largeDataset.value.length);
      }
      
      const scrollEndTime = performance.now();
      const scrollTime = scrollEndTime - scrollStartTime;
      
      console.log(`📊 滚动性能:`);
      console.log(`   - 滚动操作: 100次`);
      console.log(`   - 总时间: ${scrollTime.toFixed(2)}ms`);
      console.log(`   - 平均时间: ${(scrollTime / 100).toFixed(2)}ms/次`);
      
      expect(scrollTime, '
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 118
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 155 行发现可疑模式: ', async () => {
      // 生成测试数据
      const testData = Array.from({ length: 10000 }, (_, i) => ({
        timestamp: Date.now() + i * 100,
        value: Math.sin(i * 0.01) * 100 + Math.random() * 10,
        sequence: i
      }));
      
      const compressionStartTime = performance.now();
      
      // 执行压缩
      const compressed = DataCompressor.compressAuto(testData);
      
      const compressionEndTime = performance.now();
      const compressionTime = compressionEndTime - compressionStartTime;
      
      console.log(`📊 数据压缩性能:`);
      console.log(`   - 原始数据: ${testData.length.toLocaleString()}项`);
      console.log(`   - 原始大小: ${(compressed.originalSize / 1024).toFixed(2)}KB`);
      console.log(`   - 压缩大小: ${(compressed.compressedSize / 1024).toFixed(2)}KB`);
      console.log(`   - 压缩比: ${compressed.compressionRatio.toFixed(2)}:1`);
      console.log(`   - 压缩时间: ${compressionTime.toFixed(2)}ms`);
      
      // 验证压缩性能
      expect(compressionTime, '
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 155
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 198 行发现可疑模式: ', async () => {
      const datasets = Array.from({ length: 5 }, (_, i) => 
        Array.from({ length: 2000 }, (_, j) => ({
          timestamp: Date.now() + j * 50,
          value: Math.cos(j * 0.02 + i) * 50,
          sequence: j
        }))
      );
      
      const concurrentStartTime = performance.now();
      
      // 并发压缩
      const compressionPromises = datasets.map(data => 
        Promise.resolve().then(() => DataCompressor.compressAuto(data))
      );
      
      const results = await Promise.all(compressionPromises);
      
      const concurrentEndTime = performance.now();
      const concurrentTime = concurrentEndTime - concurrentStartTime;
      
      console.log(`📊 并发压缩性能:`);
      console.log(`   - 并发任务数: ${datasets.length}`);
      console.log(`   - 总处理时间: ${concurrentTime.toFixed(2)}ms`);
      console.log(`   - 平均压缩比: ${(results.reduce((sum, r) => sum + r.compressionRatio, 0) / results.length).toFixed(2)}:1`);
      
      expect(concurrentTime, '
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 198
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 230 行发现可疑模式: ', async () => {
      const cache = new DataCache({
        maxSize: 10000,
        maxMemory: 50 * 1024 * 1024, // 50MB
        defaultTTL: 60000,
        enableLRU: true,
        enableStats: true
      });
      
      const cacheStartTime = performance.now();
      
      // 大量写入操作
      for (let i = 0; i < 10000; i++) {
        const data = {
          id: i,
          value: Math.random() * 1000,
          data: Array.from({ length: 100 }, () => Math.random())
        };
        cache.set(`key_${i}`, data, 60000, 50);
      }
      
      const writeEndTime = performance.now();
      const writeTime = writeEndTime - cacheStartTime;
      
      // 大量读取操作
      const readStartTime = performance.now();
      let hitCount = 0;
      
      for (let i = 0; i < 10000; i++) {
        const result = cache.get(`key_${i}`);
        if (result) hitCount++;
      }
      
      const readEndTime = performance.now();
      const readTime = readEndTime - readStartTime;
      
      const stats = cache.getStats();
      
      console.log(`📊 缓存性能:`);
      console.log(`   - 写入10K项: ${writeTime.toFixed(2)}ms`);
      console.log(`   - 读取10K项: ${readTime.toFixed(2)}ms`);
      console.log(`   - 命中率: ${(stats.hitRate * 100).toFixed(1)}%`);
      console.log(`   - 内存使用: ${(stats.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
      console.log(`   - 平均访问时间: ${stats.averageAccessTime.toFixed(3)}ms`);
      
      // 验证缓存性能
      expect(writeTime, '
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 230
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 382 行发现可疑模式: ', async () => {
      const initialMetrics = performanceMonitor.getCurrentMetrics();
      
      console.log(`📊 开始长时间运行测试...`);
      console.log(`   - 初始内存: ${initialMetrics.memoryUsage.toFixed(2)}MB`);
      console.log(`   - 初始CPU: ${initialMetrics.cpuUsage.toFixed(1)}%`);
      
      // 模拟长时间高负载操作
      const iterations = 1000;
      const startTime = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        // 模拟数据处理
        const data = Array.from({ length: 100 }, (_, j) => ({
          timestamp: Date.now() + j,
          value: Math.random() * 100
        }));
        
        // 压缩和缓存操作
        const compressed = DataCompressor.compressAuto(data);
        const decompressed = DataCompressor.decompress(compressed);
        
        // 避免阻塞过久
        if (i % 100 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1));
        }
      }
      
      const endTime = performance.now();
      const finalMetrics = performanceMonitor.getCurrentMetrics();
      
      const processingTime = endTime - startTime;
      const memoryGrowth = finalMetrics.memoryUsage - initialMetrics.memoryUsage;
      
      console.log(`📊 长时间运行结果:`);
      console.log(`   - 处理时间: ${processingTime.toFixed(2)}ms`);
      console.log(`   - 处理速度: ${(iterations / (processingTime / 1000)).toFixed(0)} ops/s`);
      console.log(`   - 内存增长: ${memoryGrowth.toFixed(2)}MB`);
      console.log(`   - 最终内存: ${finalMetrics.memoryUsage.toFixed(2)}MB`);
      console.log(`   - 最终CPU: ${finalMetrics.cpuUsage.toFixed(1)}%`);
      
      // 验证性能稳定性
      expect(finalMetrics.memoryUsage, '
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 382
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 430 行发现可疑模式: ', async () => {
      const cache = new DataCache({
        maxSize: 1000,
        maxMemory: 10 * 1024 * 1024, // 10MB
        enableStats: true
      });
      
      const initialMemory = performanceMonitor.getCurrentMetrics().memoryUsage;
      
      // 填充缓存到容量上限
      for (let i = 0; i < 2000; i++) {
        const largeData = Array.from({ length: 1000 }, () => Math.random());
        cache.set(`large_${i}`, largeData, 5000);
      }
      
      const peakMemory = performanceMonitor.getCurrentMetrics().memoryUsage;
      
      // 等待部分数据过期
      await new Promise(resolve => setTimeout(resolve, 6000));
      
      // 触发清理
      const expiredCount = cache.cleanup();
      
      const finalMemory = performanceMonitor.getCurrentMetrics().memoryUsage;
      const cacheStats = cache.getStats();
      
      console.log(`📊 内存回收测试:`);
      console.log(`   - 初始内存: ${initialMemory.toFixed(2)}MB`);
      console.log(`   - 峰值内存: ${peakMemory.toFixed(2)}MB`);
      console.log(`   - 最终内存: ${finalMemory.toFixed(2)}MB`);
      console.log(`   - 过期清理: ${expiredCount}项`);
      console.log(`   - 缓存大小: ${cacheStats.size}项`);
      console.log(`   - 缓存内存: ${(cacheStats.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
      
      // 验证内存回收效果
      expect(expiredCount, '
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 430
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/plugins/PluginSystem.test.ts 第 383 行发现可疑模式: ${manifest.name}
- **文件**: tests/plugins/PluginSystem.test.ts
- **行号**: 383
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/plugins/PluginSystem.test.ts 第 387 行发现可疑模式: ${manifest.name}
- **文件**: tests/plugins/PluginSystem.test.ts
- **行号**: 387
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的Command Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/plugins/PluginSystem.test.ts 第 336 行发现可疑模式: function(
- **文件**: tests/plugins/PluginSystem.test.ts
- **行号**: 336
- **CWE ID**: CWE-78
- **建议**: 避免执行外部命令，使用安全的API替代

### 🔴 潜在的Command Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/plugins/PluginSystem.test.ts 第 382 行发现可疑模式: function(
- **文件**: tests/plugins/PluginSystem.test.ts
- **行号**: 382
- **CWE ID**: CWE-78
- **建议**: 避免执行外部命令，使用安全的API替代

### 🔴 潜在的Command Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/plugins/PluginSystem.test.ts 第 386 行发现可疑模式: function(
- **文件**: tests/plugins/PluginSystem.test.ts
- **行号**: 386
- **CWE ID**: CWE-78
- **建议**: 避免执行外部命令，使用安全的API替代

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 322 行发现可疑模式: ${project.title}
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 322
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 327 行发现可疑模式: ${project.title}
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 327
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 327 行发现可疑模式: ${project.groups.length}
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 327
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 327 行发现可疑模式: ${project.groups.reduce((sum, g) => sum + g.datasets.length, 0)}
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 327
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 561 行发现可疑模式: ${i}
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 561
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 568 行发现可疑模式: ${i}
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 568
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 568 行发现可疑模式: ${j}
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 568
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 681 行发现可疑模式: ${i}
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 681
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 697 行发现可疑模式: ${g}
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 697
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 705 行发现可疑模式: ${g}
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 705
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 705 行发现可疑模式: ${d}
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 705
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 740 行发现可疑模式: ${i}
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 740
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 745 行发现可疑模式: ${successRate.toFixed(2)}
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 745
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 745 行发现可疑模式: ${successCount}
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 745
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 745 行发现可疑模式: ${testCases}
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 745
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 768 行发现可疑模式: ${exportTime}
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 768
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 768 行发现可疑模式: ${importTime}
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 768
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 792 行发现可疑模式: ${Math.round(memoryIncrease / 1024 / 1024)}
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 792
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 218 行发现可疑模式: ');
      expect(parsedExport.groups).toHaveLength(2);
      
      // 步骤2：导入反序列化
      const importedProject = serializer.importFromSerialStudio(exportedJson);
      
      // 步骤3：验证导入的项目
      const validation = validator.validateProject(importedProject);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      
      // 步骤4：深度比较项目结构
      expect(importedProject.title).toBe(originalProject.title);
      expect(importedProject.decoder).toBe(originalProject.decoder);
      expect(importedProject.frameDetection).toBe(originalProject.frameDetection);
      expect(importedProject.frameStart).toBe(originalProject.frameStart);
      expect(importedProject.frameEnd).toBe(originalProject.frameEnd);
      expect(importedProject.groups).toHaveLength(originalProject.groups.length);
      expect(importedProject.actions).toHaveLength(originalProject.actions.length);
      
      // 验证组群数据
      for (let i = 0; i < originalProject.groups.length; i++) {
        const originalGroup = originalProject.groups[i];
        const importedGroup = importedProject.groups[i];
        
        expect(importedGroup.title).toBe(originalGroup.title);
        expect(importedGroup.widget).toBe(originalGroup.widget);
        expect(importedGroup.datasets).toHaveLength(originalGroup.datasets.length);
        
        // 验证数据集
        for (let j = 0; j < originalGroup.datasets.length; j++) {
          const originalDataset = originalGroup.datasets[j];
          const importedDataset = importedGroup.datasets[j];
          
          expect(importedDataset.title).toBe(originalDataset.title);
          expect(importedDataset.units).toBe(originalDataset.units);
          expect(importedDataset.widget).toBe(originalDataset.widget);
          expect(importedDataset.index).toBe(originalDataset.index);
          expect(importedDataset.graph).toBe(originalDataset.graph);
          expect(importedDataset.min).toBe(originalDataset.min);
          expect(importedDataset.max).toBe(originalDataset.max);
        }
      }
      
      // 验证动作数据
      for (let i = 0; i < originalProject.actions.length; i++) {
        const originalAction = originalProject.actions[i];
        const importedAction = importedProject.actions[i];
        
        expect(importedAction.title).toBe(originalAction.title);
        expect(importedAction.txData).toBe(originalAction.txData);
        expect(importedAction.timerMode).toBe(originalAction.timerMode);
        expect(importedAction.timerIntervalMs).toBe(originalAction.timerIntervalMs);
      }
    });

    it('
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 218
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 327 行发现可疑模式: ",${project.groups.length},${project.groups.reduce((sum, g) => sum + g.datasets.length, 0)}`;
            await fs.writeFile(format.path, csvContent, '
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 327
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 555 行发现可疑模式: '
      };
      
      // 创建100个组群，每个包含10个数据集
      for (let i = 0; i < 100; i++) {
        const group: Group = {
          title: `Group ${i}`,
          widget: '
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 555
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 562 行发现可疑模式: ',
          datasets: []
        };
        
        for (let j = 0; j < 10; j++) {
          const dataset: Dataset = {
            title: `Dataset ${i}-${j}`,
            units: '
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 562
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 571 行发现可疑模式: ',
            index: i * 10 + j + 1,
            graph: j % 2 === 0,
            fft: j % 3 === 0,
            led: j % 4 === 0,
            log: j % 5 === 0,
            min: 0,
            max: 100,
            alarm: 80,
            ledHigh: 1,
            fftSamples: 1024,
            fftSamplingRate: 100
          };
          group.datasets.push(dataset);
        }
        
        largeProject.groups.push(group);
      }
      
      // 导出和导入大型项目
      const startTime = Date.now();
      const exported = serializer.exportForSerialStudio(largeProject);
      const exportTime = Date.now() - startTime;
      
      const importStartTime = Date.now();
      const imported = serializer.importFromSerialStudio(exported);
      const importTime = Date.now() - importStartTime;
      
      // 验证性能（应该在合理时间内完成）
      expect(exportTime).toBeLessThan(5000); // 5秒内
      expect(importTime).toBeLessThan(5000); // 5秒内
      
      // 验证数据完整性
      expect(imported.groups).toHaveLength(100);
      expect(imported.groups[0].datasets).toHaveLength(10);
      expect(imported.groups[99].datasets).toHaveLength(10);
      
      // 验证总数据集数量
      const totalDatasets = imported.groups.reduce((sum, group) => sum + group.datasets.length, 0);
      expect(totalDatasets).toBe(1000);
    });

    it('
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 571
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 673 行发现可疑模式: ', async () => {
      const testCases = 100;
      let successCount = 0;
      
      for (let i = 0; i < testCases; i++) {
        try {
          // 创建随机测试项目
          const project: ProjectConfig = {
            title: `测试项目 ${i}`,
            decoder: Math.floor(Math.random() * 4),
            frameDetection: Math.floor(Math.random() * 3) + 1,
            frameStart: String.fromCharCode(33 + Math.floor(Math.random() * 94)),
            frameEnd: String.fromCharCode(33 + Math.floor(Math.random() * 94)),
            frameParser: `function parse(frame) { return frame.split("
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 673
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 690 行发现可疑模式: '
          };
          
          // 添加随机数量的组群和数据集
          const groupCount = Math.floor(Math.random() * 5) + 1;
          for (let g = 0; g < groupCount; g++) {
            const group: Group = {
              title: `Group ${g}`,
              widget: '
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 690
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 698 行发现可疑模式: ',
              datasets: []
            };
            
            const datasetCount = Math.floor(Math.random() * 3) + 1;
            for (let d = 0; d < datasetCount; d++) {
              const dataset: Dataset = {
                title: `Dataset ${g}-${d}`,
                units: ['
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 698
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 708 行发现可疑模式: ',
                index: g * 10 + d + 1,
                graph: Math.random() > 0.5,
                fft: Math.random() > 0.7,
                led: Math.random() > 0.8,
                log: Math.random() > 0.3,
                min: Math.floor(Math.random() * 100),
                max: Math.floor(Math.random() * 100) + 100,
                alarm: Math.floor(Math.random() * 200),
                ledHigh: Math.random(),
                fftSamples: [512, 1024, 2048][Math.floor(Math.random() * 3)],
                fftSamplingRate: [50, 100, 200][Math.floor(Math.random() * 3)]
              };
              group.datasets.push(dataset);
            }
            
            project.groups.push(group);
          }
          
          // 执行导出导入循环
          const exported = serializer.exportForSerialStudio(project);
          const imported = serializer.importFromSerialStudio(exported);
          
          // 验证基本属性
          if (imported.title === project.title &&
              imported.decoder === project.decoder &&
              imported.groups.length === project.groups.length) {
            successCount++;
          }
          
        } catch (error) {
          // 测试失败，不增加成功计数
          console.warn(`Test case ${i} failed:`, error);
        }
      }
      
      const successRate = (successCount / testCases) * 100;
      console.log(`导入导出成功率: ${successRate.toFixed(2)}% (${successCount}/${testCases})`);
      
      // 验证达到≥99%成功率
      expect(successRate).toBeGreaterThanOrEqual(99);
    });

    it('
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 708
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 771 行发现可疑模式: ', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // 执行大量导入导出操作
      for (let i = 0; i < 50; i++) {
        const project = createComplexProject();
        const exported = serializer.exportForSerialStudio(project);
        const imported = serializer.importFromSerialStudio(exported);
        
        // 确保导入正确
        expect(imported.title).toBe(project.title);
      }
      
      // 强制垃圾回收（如果可用）
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      console.log(`内存使用增长: ${Math.round(memoryIncrease / 1024 / 1024)}MB`);
      
      // 验证内存使用没有大幅增长（应该控制在合理范围内）
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // 100MB以内
    });
  });

  function createComplexProject(): ProjectConfig {
    return {
      title: '
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 771
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/quality/ThemeI18nQualityMetrics.test.ts 第 65 行发现可疑模式: ${duration}
- **文件**: tests/quality/ThemeI18nQualityMetrics.test.ts
- **行号**: 65
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/quality/ThemeI18nQualityMetrics.test.ts 第 82 行发现可疑模式: ${duration}
- **文件**: tests/quality/ThemeI18nQualityMetrics.test.ts
- **行号**: 82
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/quality/ThemeI18nQualityMetrics.test.ts 第 105 行发现可疑模式: ${successRate}
- **文件**: tests/quality/ThemeI18nQualityMetrics.test.ts
- **行号**: 105
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/quality/ThemeI18nQualityMetrics.test.ts 第 124 行发现可疑模式: ${successRate}
- **文件**: tests/quality/ThemeI18nQualityMetrics.test.ts
- **行号**: 124
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/quality/ThemeI18nQualityMetrics.test.ts 第 147 行发现可疑模式: ${averageTime.toFixed(2)}
- **文件**: tests/quality/ThemeI18nQualityMetrics.test.ts
- **行号**: 147
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/quality/ThemeI18nQualityMetrics.test.ts 第 148 行发现可疑模式: ${maxTime}
- **文件**: tests/quality/ThemeI18nQualityMetrics.test.ts
- **行号**: 148
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/quality/ThemeI18nQualityMetrics.test.ts 第 178 行发现可疑模式: ${averageTime.toFixed(2)}
- **文件**: tests/quality/ThemeI18nQualityMetrics.test.ts
- **行号**: 178
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/quality/ThemeI18nQualityMetrics.test.ts 第 179 行发现可疑模式: ${maxTime}
- **文件**: tests/quality/ThemeI18nQualityMetrics.test.ts
- **行号**: 179
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/quality/ThemeI18nQualityMetrics.test.ts 第 231 行发现可疑模式: ${completeness.toFixed(1)}
- **文件**: tests/quality/ThemeI18nQualityMetrics.test.ts
- **行号**: 231
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/quality/ThemeI18nQualityMetrics.test.ts 第 231 行发现可疑模式: ${successfulTranslations}
- **文件**: tests/quality/ThemeI18nQualityMetrics.test.ts
- **行号**: 231
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/quality/ThemeI18nQualityMetrics.test.ts 第 231 行发现可疑模式: ${totalTests}
- **文件**: tests/quality/ThemeI18nQualityMetrics.test.ts
- **行号**: 231
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/quality/ThemeI18nQualityMetrics.test.ts 第 248 行发现可疑模式: ${availableLanguages.length}
- **文件**: tests/quality/ThemeI18nQualityMetrics.test.ts
- **行号**: 248
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/quality/ThemeI18nQualityMetrics.test.ts 第 248 行发现可疑模式: ${definedLanguages.length}
- **文件**: tests/quality/ThemeI18nQualityMetrics.test.ts
- **行号**: 248
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/quality/ThemeI18nQualityMetrics.test.ts 第 282 行发现可疑模式: ${operations}
- **文件**: tests/quality/ThemeI18nQualityMetrics.test.ts
- **行号**: 282
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/quality/ThemeI18nQualityMetrics.test.ts 第 282 行发现可疑模式: ${duration}
- **文件**: tests/quality/ThemeI18nQualityMetrics.test.ts
- **行号**: 282
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/quality/ThemeI18nQualityMetrics.test.ts 第 282 行发现可疑模式: ${avgTime.toFixed(2)}
- **文件**: tests/quality/ThemeI18nQualityMetrics.test.ts
- **行号**: 282
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/quality/ThemeI18nQualityMetrics.test.ts 第 303 行发现可疑模式: ${operations}
- **文件**: tests/quality/ThemeI18nQualityMetrics.test.ts
- **行号**: 303
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/quality/ThemeI18nQualityMetrics.test.ts 第 303 行发现可疑模式: ${duration}
- **文件**: tests/quality/ThemeI18nQualityMetrics.test.ts
- **行号**: 303
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/quality/ThemeI18nQualityMetrics.test.ts 第 303 行发现可疑模式: ${avgTime.toFixed(3)}
- **文件**: tests/quality/ThemeI18nQualityMetrics.test.ts
- **行号**: 303
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/quality/ThemeI18nQualityMetrics.test.ts 第 327 行发现可疑模式: ${(memoryIncrease / 1024 / 1024).toFixed(2)}
- **文件**: tests/quality/ThemeI18nQualityMetrics.test.ts
- **行号**: 327
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/quality/ThemeI18nQualityMetrics.test.ts 第 130 行发现可疑模式: '];
        const responseTimes: number[] = [];
        
        for (const theme of testThemes) {
          const startTime = Date.now();
          await themeManager.setTheme(theme);
          const endTime = Date.now();
          
          const responseTime = endTime - startTime;
          responseTimes.push(responseTime);
          
          expect(responseTime).toBeLessThanOrEqual(500);
        }
        
        const averageTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const maxTime = Math.max(...responseTimes);
        
        console.log(`主题切换平均响应时间: ${averageTime.toFixed(2)}ms`);
        console.log(`主题切换最大响应时间: ${maxTime}ms (目标: ≤500ms)`);
        
        expect(maxTime).toBeLessThanOrEqual(500);
      });

      it('
- **文件**: tests/quality/ThemeI18nQualityMetrics.test.ts
- **行号**: 130
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/quality/ThemeI18nQualityMetrics.test.ts 第 153 行发现可疑模式: ', async () => {
        const testLocales = [
          SupportedLocales.EN_US,
          SupportedLocales.ZH_CN,
          SupportedLocales.DE_DE,
          SupportedLocales.FR_FR,
          SupportedLocales.ES_MX
        ];
        
        const responseTimes: number[] = [];
        
        for (const locale of testLocales) {
          const startTime = Date.now();
          await i18nManager.setLocale(locale);
          const endTime = Date.now();
          
          const responseTime = endTime - startTime;
          responseTimes.push(responseTime);
          
          expect(responseTime).toBeLessThanOrEqual(500);
        }
        
        const averageTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const maxTime = Math.max(...responseTimes.length);
        
        console.log(`语言切换平均响应时间: ${averageTime.toFixed(2)}ms`);
        console.log(`语言切换最大响应时间: ${maxTime}ms (目标: ≤500ms)`);
        
        expect(maxTime).toBeLessThanOrEqual(500);
      });
    });

    describe('
- **文件**: tests/quality/ThemeI18nQualityMetrics.test.ts
- **行号**: 153
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/quality/ThemeI18nQualityMetrics.test.ts 第 202 行发现可疑模式: '
        ];
        
        const locales = [
          SupportedLocales.EN_US,
          SupportedLocales.ZH_CN,
          SupportedLocales.DE_DE,
          SupportedLocales.FR_FR
        ];
        
        let totalTests = 0;
        let successfulTranslations = 0;
        
        for (const locale of locales) {
          await i18nManager.setLocale(locale);
          
          for (const key of testKeys) {
            totalTests++;
            const translation = i18nManager.t(key);
            
            // 检查翻译是否有效（不是错误格式）
            if (translation && !translation.startsWith('
- **文件**: tests/quality/ThemeI18nQualityMetrics.test.ts
- **行号**: 202
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/quality/ThemeI18nQualityMetrics.test.ts 第 223 行发现可疑模式: ')) {
              successfulTranslations++;
            }
          }
        }
        
        const completeness = (successfulTranslations / totalTests) * 100;
        
        console.log(`翻译完整性: ${completeness.toFixed(1)}% (${successfulTranslations}/${totalTests})`);
        console.log(`目标: ≥95%`);
        
        expect(completeness).toBeGreaterThanOrEqual(95);
      });

      it('
- **文件**: tests/quality/ThemeI18nQualityMetrics.test.ts
- **行号**: 223
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/quality/ThemeI18nQualityMetrics.test.ts 第 268 行发现可疑模式: ', async () => {
        const operations = 100;
        const startTime = Date.now();
        
        for (let i = 0; i < operations; i++) {
          const themes = ['
- **文件**: tests/quality/ThemeI18nQualityMetrics.test.ts
- **行号**: 268
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/quality/ThemeI18nQualityMetrics.test.ts 第 290 行发现可疑模式: '];
        
        const startTime = Date.now();
        
        for (let i = 0; i < operations; i++) {
          const key = keys[i % keys.length];
          i18nManager.t(key);
        }
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        const avgTime = duration / operations;
        
        console.log(`批量翻译 (${operations}次): 总时间${duration}ms, 平均${avgTime.toFixed(3)}ms/次`);
        
        // 平均每次翻译应该在1ms以内
        expect(avgTime).toBeLessThanOrEqual(1);
      });

      it('
- **文件**: tests/quality/ThemeI18nQualityMetrics.test.ts
- **行号**: 290
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 tests/quality/ThemeI18nQualityMetrics.test.ts 第 309 行发现可疑模式: ', async () => {
        // 模拟内存使用检查
        const initialMemory = process.memoryUsage().heapUsed;
        
        // 执行大量操作
        for (let i = 0; i < 100; i++) {
          await themeManager.setTheme(i % 2 === 0 ? '
- **文件**: tests/quality/ThemeI18nQualityMetrics.test.ts
- **行号**: 309
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/App.vue 第 265 行发现可疑模式: ') {
    event.preventDefault();
    toggleFullscreen();
  }
  
  // Ctrl+P: 暂停/恢复
  if (event.ctrlKey && event.key === '
- **文件**: webview/App.vue
- **行号**: 265
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/App.vue 第 271 行发现可疑模式: ') {
    event.preventDefault();
    togglePause();
  }
  
  // Ctrl+Shift+C: 清除数据
  if (event.ctrlKey && event.shiftKey && event.key === '
- **文件**: webview/App.vue
- **行号**: 271
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/ProjectEditor.vue 第 154 行发现可疑模式: ${validationResult.errors.length}
- **文件**: webview/components/ProjectEditor.vue
- **行号**: 154
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/ProjectEditor.vue 第 334 行发现可疑模式: ',
    inputPattern: /^.+$/,
    inputErrorMessage: '
- **文件**: webview/components/ProjectEditor.vue
- **行号**: 334
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/ProjectEditor.vue 第 367 行发现可疑模式: ',
    inputPattern: /^.+$/,
    inputErrorMessage: '
- **文件**: webview/components/ProjectEditor.vue
- **行号**: 367
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/ProjectEditor.vue 第 401 行发现可疑模式: ',
    inputPattern: /^.+$/,
    inputErrorMessage: '
- **文件**: webview/components/ProjectEditor.vue
- **行号**: 401
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/base/BaseWidget.vue 第 10 行发现可疑模式: ${widgetType}
- **文件**: webview/components/base/BaseWidget.vue
- **行号**: 10
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/base/BaseWidget.vue 第 323 行发现可疑模式: ${props.widgetType}
- **文件**: webview/components/base/BaseWidget.vue
- **行号**: 323
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/base/BaseWidget.vue 第 350 行发现可疑模式: ${Math.floor(diff / 1000)}
- **文件**: webview/components/base/BaseWidget.vue
- **行号**: 350
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/base/BaseWidget.vue 第 351 行发现可疑模式: ${Math.floor(diff / 60000)}
- **文件**: webview/components/base/BaseWidget.vue
- **行号**: 351
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/base/BaseWidget.vue 第 352 行发现可疑模式: ${Math.floor(diff / 3600000)}
- **文件**: webview/components/base/BaseWidget.vue
- **行号**: 352
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/base/BaseWidget.vue 第 358 行发现可疑模式: ${props.width}
- **文件**: webview/components/base/BaseWidget.vue
- **行号**: 358
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/base/BaseWidget.vue 第 359 行发现可疑模式: ${props.height}
- **文件**: webview/components/base/BaseWidget.vue
- **行号**: 359
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/base/BaseWidget.vue 第 360 行发现可疑模式: ${props.minWidth}
- **文件**: webview/components/base/BaseWidget.vue
- **行号**: 360
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/base/BaseWidget.vue 第 361 行发现可疑模式: ${props.minHeight}
- **文件**: webview/components/base/BaseWidget.vue
- **行号**: 361
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/base/BaseWidget.vue 第 362 行发现可疑模式: ${props.maxWidth}
- **文件**: webview/components/base/BaseWidget.vue
- **行号**: 362
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/base/BaseWidget.vue 第 363 行发现可疑模式: ${props.maxHeight}
- **文件**: webview/components/base/BaseWidget.vue
- **行号**: 363
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/base/BaseWidget.vue 第 481 行发现可疑模式: ${props.widgetType}
- **文件**: webview/components/base/BaseWidget.vue
- **行号**: 481
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/DataExportDialog.vue 第 66 行发现可疑模式: ${dataset.title}
- **文件**: webview/components/dialogs/DataExportDialog.vue
- **行号**: 66
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/DataExportDialog.vue 第 66 行发现可疑模式: ${dataset.units}
- **文件**: webview/components/dialogs/DataExportDialog.vue
- **行号**: 66
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/DataExportDialog.vue 第 469 行发现可疑模式: ${exportConfig.file.name}
- **文件**: webview/components/dialogs/DataExportDialog.vue
- **行号**: 469
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/DataExportDialog.vue 第 556 行发现可疑模式: ${result.filePath}
- **文件**: webview/components/dialogs/DataExportDialog.vue
- **行号**: 556
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/DataExportDialog.vue 第 562 行发现可疑模式: ${error.message}
- **文件**: webview/components/dialogs/DataExportDialog.vue
- **行号**: 562
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/DataExportDialog.vue 第 643 行发现可疑模式: ${hours}
- **文件**: webview/components/dialogs/DataExportDialog.vue
- **行号**: 643
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/DataExportDialog.vue 第 643 行发现可疑模式: ${(minutes % 60).toString().padStart(2, '0')}
- **文件**: webview/components/dialogs/DataExportDialog.vue
- **行号**: 643
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/DataExportDialog.vue 第 643 行发现可疑模式: ${(seconds % 60).toString().padStart(2, '0')}
- **文件**: webview/components/dialogs/DataExportDialog.vue
- **行号**: 643
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/DataExportDialog.vue 第 645 行发现可疑模式: ${minutes}
- **文件**: webview/components/dialogs/DataExportDialog.vue
- **行号**: 645
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/DataExportDialog.vue 第 645 行发现可疑模式: ${(seconds % 60).toString().padStart(2, '0')}
- **文件**: webview/components/dialogs/DataExportDialog.vue
- **行号**: 645
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/DataExportDialog.vue 第 647 行发现可疑模式: ${seconds}
- **文件**: webview/components/dialogs/DataExportDialog.vue
- **行号**: 647
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/DataExportDialog.vue 第 693 行发现可疑模式: ${timestamp}
- **文件**: webview/components/dialogs/DataExportDialog.vue
- **行号**: 693
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/DataExportDialog.vue 第 425 行发现可疑模式: '];
    exportConfig.dataSource.range = undefined;
  }
};

const handleDateRangeChange = (dates: [string, string] | null) => {
  if (dates && dates.length === 2) {
    exportConfig.dataSource.range = {
      startTime: new Date(dates[0]),
      endTime: new Date(dates[1])
    };
  } else {
    exportConfig.dataSource.range = undefined;
  }
};

const handleFormatChange = () => {
  // 重置格式选项为默认值
  const format = supportedFormats.value.find(f => f.type === exportConfig.format.type);
  if (format) {
    exportConfig.format.options = { ...format.options };
  }
  
  // 更新文件扩展名
  updateFileExtension();
};

const handleFileNameChange = () => {
  updateFilePath();
  checkFileExists();
};

const updateFileExtension = () => {
  const format = supportedFormats.value.find(f => f.type === exportConfig.format.type);
  if (format && format.extensions.length > 0) {
    const currentName = exportConfig.file.name;
    const nameWithoutExt = currentName.replace(/\.[^/.]+$/, '
- **文件**: webview/components/dialogs/DataExportDialog.vue
- **行号**: 425
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/DataExportDialog.vue 第 461 行发现可疑模式: ');
    exportConfig.file.name = nameWithoutExt + format.extensions[0];
  }
};

const updateFilePath = () => {
  if (exportConfig.file.name) {
    // 这里应该使用 VSCode API 获取工作区路径
    exportConfig.file.path = `/tmp/${exportConfig.file.name}`;
  }
};

const checkFileExists = async () => {
  // 这里应该检查文件是否存在
  fileExists.value = false;
};

const selectSavePath = async () => {
  try {
    // 这里应该调用 VSCode API 打开文件选择对话框
    const result = await window.vscode.postMessage({
      command: '
- **文件**: webview/components/dialogs/DataExportDialog.vue
- **行号**: 461
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/ExportProgressDialog.vue 第 101 行发现可疑模式: ${log.level}
- **文件**: webview/components/dialogs/ExportProgressDialog.vue
- **行号**: 101
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/ExportProgressDialog.vue 第 132 行发现可疑模式: ${progress.totalRecords}
- **文件**: webview/components/dialogs/ExportProgressDialog.vue
- **行号**: 132
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/ExportProgressDialog.vue 第 251 行发现可疑模式: ${(speed / 1000).toFixed(1)}
- **文件**: webview/components/dialogs/ExportProgressDialog.vue
- **行号**: 251
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/ExportProgressDialog.vue 第 253 行发现可疑模式: ${Math.round(speed)}
- **文件**: webview/components/dialogs/ExportProgressDialog.vue
- **行号**: 253
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/ExportProgressDialog.vue 第 304 行发现可疑模式: ${hours}
- **文件**: webview/components/dialogs/ExportProgressDialog.vue
- **行号**: 304
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/ExportProgressDialog.vue 第 304 行发现可疑模式: ${(minutes % 60).toString().padStart(2, '0')}
- **文件**: webview/components/dialogs/ExportProgressDialog.vue
- **行号**: 304
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/ExportProgressDialog.vue 第 304 行发现可疑模式: ${(seconds % 60).toString().padStart(2, '0')}
- **文件**: webview/components/dialogs/ExportProgressDialog.vue
- **行号**: 304
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/ExportProgressDialog.vue 第 306 行发现可疑模式: ${minutes}
- **文件**: webview/components/dialogs/ExportProgressDialog.vue
- **行号**: 306
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/ExportProgressDialog.vue 第 306 行发现可疑模式: ${(seconds % 60).toString().padStart(2, '0')}
- **文件**: webview/components/dialogs/ExportProgressDialog.vue
- **行号**: 306
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/ExportProgressDialog.vue 第 308 行发现可疑模式: ${seconds}
- **文件**: webview/components/dialogs/ExportProgressDialog.vue
- **行号**: 308
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/ExportProgressDialog.vue 第 388 行发现可疑模式: ${getStageTitle(newProgress.stage)}
- **文件**: webview/components/dialogs/ExportProgressDialog.vue
- **行号**: 388
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/ExportProgressDialog.vue 第 393 行发现可疑模式: ${formatNumber(newProgress.processedRecords)}
- **文件**: webview/components/dialogs/ExportProgressDialog.vue
- **行号**: 393
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/ExportProgressDialog.vue 第 405 行发现可疑模式: ${error.message}
- **文件**: webview/components/dialogs/ExportProgressDialog.vue
- **行号**: 405
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/WidgetExportDialog.vue 第 9 行发现可疑模式: ${widgetTypeName}
- **文件**: webview/components/dialogs/WidgetExportDialog.vue
- **行号**: 9
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/WidgetExportDialog.vue 第 367 行发现可疑模式: ${typeName}
- **文件**: webview/components/dialogs/WidgetExportDialog.vue
- **行号**: 367
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/WidgetExportDialog.vue 第 367 行发现可疑模式: ${timestamp}
- **文件**: webview/components/dialogs/WidgetExportDialog.vue
- **行号**: 367
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/WidgetExportDialog.vue 第 449 行发现可疑模式: ${i + 1}
- **文件**: webview/components/dialogs/WidgetExportDialog.vue
- **行号**: 449
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/WidgetExportDialog.vue 第 312 行发现可疑模式: "/\\|?*]+$/, 
      message: '
- **文件**: webview/components/dialogs/WidgetExportDialog.vue
- **行号**: 312
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/WidgetExportDialog.vue 第 398 行发现可疑模式: ', width: 80 }
        ],
        data: Array.from({ length: 50 }, (_, i) => ({
          timestamp: new Date(Date.now() - (49 - i) * 1000).toISOString(),
          value: (Math.sin(i * 0.1) * 100 + Math.random() * 20).toFixed(2),
          unit: '
- **文件**: webview/components/dialogs/WidgetExportDialog.vue
- **行号**: 398
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/WidgetExportDialog.vue 第 431 行发现可疑模式: ', width: 100 }
        ],
        data: Array.from({ length: 20 }, (_, i) => ({
          timestamp: new Date(Date.now() - (19 - i) * 5000).toISOString(),
          latitude: (39.9042 + (Math.random() - 0.5) * 0.01).toFixed(6),
          longitude: (116.4074 + (Math.random() - 0.5) * 0.01).toFixed(6),
          altitude: (50 + Math.random() * 10).toFixed(1)
        }))
      };
      
    default:
      return {
        columns: [
          { prop: '
- **文件**: webview/components/dialogs/WidgetExportDialog.vue
- **行号**: 431
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/WidgetExportDialog.vue 第 445 行发现可疑模式: ', width: 200 }
        ],
        data: Array.from({ length: 25 }, (_, i) => ({
          timestamp: new Date(Date.now() - (24 - i) * 1000).toISOString(),
          data: `Sample data ${i + 1}`
        }))
      };
  }
};

const handleClose = () => {
  visible.value = false;
  emit('
- **文件**: webview/components/dialogs/WidgetExportDialog.vue
- **行号**: 445
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/WidgetSettingsDialog.vue 第 9 行发现可疑模式: ${widgetTypeName}
- **文件**: webview/components/dialogs/WidgetSettingsDialog.vue
- **行号**: 9
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/CSVFormatOptions.vue 第 186 行发现可疑模式: ${quote}
- **文件**: webview/components/dialogs/format-options/CSVFormatOptions.vue
- **行号**: 186
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/CSVFormatOptions.vue 第 186 行发现可疑模式: ${h}
- **文件**: webview/components/dialogs/format-options/CSVFormatOptions.vue
- **行号**: 186
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/CSVFormatOptions.vue 第 186 行发现可疑模式: ${quote}
- **文件**: webview/components/dialogs/format-options/CSVFormatOptions.vue
- **行号**: 186
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/CSVFormatOptions.vue 第 206 行发现可疑模式: ${quote}
- **文件**: webview/components/dialogs/format-options/CSVFormatOptions.vue
- **行号**: 206
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/CSVFormatOptions.vue 第 206 行发现可疑模式: ${value}
- **文件**: webview/components/dialogs/format-options/CSVFormatOptions.vue
- **行号**: 206
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/CSVFormatOptions.vue 第 206 行发现可疑模式: ${quote}
- **文件**: webview/components/dialogs/format-options/CSVFormatOptions.vue
- **行号**: 206
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/CSVFormatOptions.vue 第 185 行发现可疑模式: '];
    const quotedHeaders = headers.map(h => quote ? `${quote}${h}${quote}` : h);
    preview += quotedHeaders.join(delimiter) + lineEnding;
  }
  
  // 添加示例数据
  const sampleData = [
    ['
- **文件**: webview/components/dialogs/format-options/CSVFormatOptions.vue
- **行号**: 185
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/CSVFormatOptions.vue 第 200 行发现可疑模式: ')) {
        const num = parseFloat(value);
        value = num.toFixed(options.value.precision || 2);
      }
      
      // 应用引号
      return quote ? `${quote}${value}${quote}` : value;
    });
    preview += quotedRow.join(delimiter) + lineEnding;
  });
  
  return preview;
});

// 方法
const updateOptions = () => {
  emit('
- **文件**: webview/components/dialogs/format-options/CSVFormatOptions.vue
- **行号**: 200
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/ExcelFormatOptions.vue 第 61 行发现可疑模式: "0.00E+00"
- **文件**: webview/components/dialogs/format-options/ExcelFormatOptions.vue
- **行号**: 61
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/ExcelFormatOptions.vue 第 240 行发现可疑模式: "> + Metadata</span>
        </div>
        <div class="
- **文件**: webview/components/dialogs/format-options/ExcelFormatOptions.vue
- **行号**: 240
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/ExcelFormatOptions.vue 第 394 行发现可疑模式: '0.00E+00'
- **文件**: webview/components/dialogs/format-options/ExcelFormatOptions.vue
- **行号**: 394
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/ExcelFormatOptions.vue 第 395 行发现可疑模式: '1.23E+03'
- **文件**: webview/components/dialogs/format-options/ExcelFormatOptions.vue
- **行号**: 395
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/ExcelFormatOptions.vue 第 400 行发现可疑模式: ':
      return customNumberFormat.value + '
- **文件**: webview/components/dialogs/format-options/ExcelFormatOptions.vue
- **行号**: 400
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/ExcelFormatOptions.vue 第 401 行发现可疑模式: ' + value.toFixed(2);
    default:
      return format + '
- **文件**: webview/components/dialogs/format-options/ExcelFormatOptions.vue
- **行号**: 401
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/JSONFormatOptions.vue 第 217 行发现可疑模式: ', { ...options.value });
};

const handleChunkingChange = () => {
  if (!enableChunking.value) {
    delete options.value.chunkSize;
  }
  updateOptions();
};

const generateSampleData = () => {
  const now = new Date();
  const baseTime = now.getTime();
  
  return [
    {
      timestamp: formatTimestamp(new Date(baseTime), options.value.timeFormat),
      temperature: formatNumber(23.45, options.value.precision),
      humidity: formatNumber(65.2, options.value.precision),
      pressure: formatNumber(1013.25, options.value.precision)
    },
    {
      timestamp: formatTimestamp(new Date(baseTime + 1000), options.value.timeFormat),
      temperature: formatNumber(23.46, options.value.precision),
      humidity: formatNumber(65.1, options.value.precision),
      pressure: formatNumber(1013.23, options.value.precision)
    },
    {
      timestamp: formatTimestamp(new Date(baseTime + 2000), options.value.timeFormat),
      temperature: formatNumber(23.44, options.value.precision),
      humidity: formatNumber(65.3, options.value.precision),
      pressure: formatNumber(1013.27, options.value.precision)
    }
  ];
};

const formatTimestamp = (date: Date, format?: string) => {
  switch (format) {
    case '
- **文件**: webview/components/dialogs/format-options/JSONFormatOptions.vue
- **行号**: 217
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 288 行发现可疑模式: ${opts.namespacePrefix}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 288
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 294 行发现可疑模式: ${opts.xmlVersion || '1.0'}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 294
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 294 行发现可疑模式: ${opts.encoding}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 294
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 294 行发现可疑模式: ${newline}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 294
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 299 行发现可疑模式: ${newline}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 299
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 300 行发现可疑模式: ${new Date().toISOString()}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 300
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 300 行发现可疑模式: ${newline}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 300
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 304 行发现可疑模式: ${nsPrefix}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 304
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 304 行发现可疑模式: ${opts.rootElement}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 304
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 306 行发现可疑模式: ${opts.namespacePrefix ? ':' + opts.namespacePrefix : ''}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 306
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 306 行发现可疑模式: ${opts.namespace}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 306
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 308 行发现可疑模式: ${newline}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 308
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 312 行发现可疑模式: ${indent}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 312
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 312 行发现可疑模式: ${nsPrefix}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 312
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 312 行发现可疑模式: ${newline}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 312
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 313 行发现可疑模式: ${indent}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 313
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 313 行发现可疑模式: ${indent}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 313
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 313 行发现可疑模式: ${nsPrefix}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 313
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 313 行发现可疑模式: ${new Date().toISOString()}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 313
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 313 行发现可疑模式: ${nsPrefix}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 313
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 313 行发现可疑模式: ${newline}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 313
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 314 行发现可疑模式: ${indent}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 314
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 314 行发现可疑模式: ${indent}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 314
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 314 行发现可疑模式: ${nsPrefix}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 314
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 314 行发现可疑模式: ${nsPrefix}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 314
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 314 行发现可疑模式: ${newline}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 314
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 315 行发现可疑模式: ${indent}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 315
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 315 行发现可疑模式: ${indent}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 315
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 315 行发现可疑模式: ${nsPrefix}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 315
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 315 行发现可疑模式: ${nsPrefix}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 315
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 315 行发现可疑模式: ${newline}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 315
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 316 行发现可疑模式: ${indent}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 316
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 316 行发现可疑模式: ${nsPrefix}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 316
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 316 行发现可疑模式: ${newline}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 316
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 328 行发现可疑模式: ${indent}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 328
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 328 行发现可疑模式: ${nsPrefix}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 328
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 328 行发现可疑模式: ${opts.recordElement}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 328
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 331 行发现可疑模式: ${key}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 331
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 331 行发现可疑模式: ${formattedValue}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 331
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 333 行发现可疑模式: ${nsPrefix}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 333
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 333 行发现可疑模式: ${opts.recordElement}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 333
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 336 行发现可疑模式: ${indent}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 336
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 336 行发现可疑模式: ${nsPrefix}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 336
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 336 行发现可疑模式: ${opts.recordElement}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 336
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 336 行发现可疑模式: ${newline}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 336
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 351 行发现可疑模式: ${indent}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 351
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 351 行发现可疑模式: ${indent}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 351
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 351 行发现可疑模式: ${nsPrefix}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 351
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 351 行发现可疑模式: ${key}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 351
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 355 行发现可疑模式: ${type}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 355
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 363 行发现可疑模式: ${formattedValue}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 363
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 368 行发现可疑模式: ${nsPrefix}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 368
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 368 行发现可疑模式: ${key}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 368
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 368 行发现可疑模式: ${newline}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 368
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 371 行发现可疑模式: ${indent}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 371
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 371 行发现可疑模式: ${nsPrefix}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 371
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 371 行发现可疑模式: ${opts.recordElement}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 371
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 371 行发现可疑模式: ${newline}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 371
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 376 行发现可疑模式: ${nsPrefix}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 376
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 376 行发现可疑模式: ${opts.rootElement}
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 376
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 290 行发现可疑模式: ';
  
  // XML声明
  if (opts.includeDeclaration) {
    xml += `<?xml version="
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 290
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 294 行发现可疑模式: "?>${newline}`;
  }
  
  // 注释
  if (opts.includeComments) {
    xml += `<!-- Serial-Studio Data Export -->${newline}`;
    xml += `<!-- Generated: ${new Date().toISOString()} -->${newline}`;
  }
  
  // 根元素开始
  xml += `<${nsPrefix}${opts.rootElement}`;
  if (opts.namespace) {
    xml += ` xmlns${opts.namespacePrefix ? '
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 294
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 306 行发现可疑模式: ' + opts.namespacePrefix : '
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 306
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 306 行发现可疑模式: "`;
  }
  xml += `>${newline}`;
  
  // 元数据
  if (opts.includeMetadata) {
    xml += `${indent}<${nsPrefix}metadata>${newline}`;
    xml += `${indent}${indent}<${nsPrefix}exportTime>${new Date().toISOString()}</${nsPrefix}exportTime>${newline}`;
    xml += `${indent}${indent}<${nsPrefix}version>1.0.0</${nsPrefix}version>${newline}`;
    xml += `${indent}${indent}<${nsPrefix}source>Serial-Studio VSCode Extension</${nsPrefix}source>${newline}`;
    xml += `${indent}</${nsPrefix}metadata>${newline}`;
  }
  
  // 数据记录
  const sampleData = [
    { timestamp: '
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 306
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 323 行发现可疑模式: ', temperature: 23.44, humidity: 65.3, pressure: 1013.27 }
  ];
  
  sampleData.forEach(record => {
    if (opts.includeAttributes) {
      xml += `${indent}<${nsPrefix}${opts.recordElement}`;
      Object.entries(record).forEach(([key, value]) => {
        const formattedValue = formatValue(value, opts);
        xml += ` ${key}="
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 323
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 331 行发现可疑模式: "`;
      });
      xml += opts.nullHandling === '
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 331
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 333 行发现可疑模式: ' : `></${nsPrefix}${opts.recordElement}>`;
      xml += newline;
    } else {
      xml += `${indent}<${nsPrefix}${opts.recordElement}>${newline}`;
      
      const entries = Object.entries(record);
      if (opts.elementOrder === '
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 333
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 344 行发现可疑模式: ') return 1;
          return 0;
        });
      }
      
      entries.forEach(([key, value]) => {
        const formattedValue = formatValue(value, opts);
        xml += `${indent}${indent}<${nsPrefix}${key}`;
        
        if (opts.includeDataTypes) {
          const type = typeof value === '
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 344
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 354 行发现可疑模式: ';
          xml += ` type="
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 354
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 355 行发现可疑模式: "`;
        }
        
        xml += '
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 355
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 362 行发现可疑模式: ' && hasSpecialChars(String(value)))) {
          xml += `<![CDATA[${formattedValue}]]>`;
        } else {
          xml += escapeXml(String(formattedValue));
        }
        
        xml += `</${nsPrefix}${key}>${newline}`;
      });
      
      xml += `${indent}</${nsPrefix}${opts.recordElement}>${newline}`;
    }
  });
  
  // 根元素结束
  xml += `</${nsPrefix}${opts.rootElement}>`;
  
  return xml;
};

const formatValue = (value: any, opts: ExtendedXMLOptions) => {
  if (typeof value === '
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 362
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/test/GPSWidgetTest.vue 第 264 行发现可疑模式: ${pathType.value}
- **文件**: webview/components/test/GPSWidgetTest.vue
- **行号**: 264
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/test/GPSWidgetTest.vue 第 264 行发现可疑模式: ${pathRadius.value.toFixed(6)}
- **文件**: webview/components/test/GPSWidgetTest.vue
- **行号**: 264
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/test/GPSWidgetTest.vue 第 264 行发现可疑模式: ${simulationSpeed.value.toFixed(1)}
- **文件**: webview/components/test/GPSWidgetTest.vue
- **行号**: 264
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/test/GPSWidgetTest.vue 第 155 行发现可疑模式: ',
    widget: WidgetType.GPS,
    graph: true,
    log: true,
    led: false,
    alarm: false,
    fft: false
  }
])

// 开始GPS模拟
const startSimulation = () => {
  if (isSimulating.value) return

  isSimulating.value = true
  pathStep.value = 0
  updateCount.value = 0

  simulationInterval.value = setInterval(() => {
    updateGPSPosition()
    updateMockDatasets()
    pathStep.value++
    updateCount.value++
  }, 1000 / simulationSpeed.value)
}

// 停止GPS模拟
const stopSimulation = () => {
  isSimulating.value = false
  if (simulationInterval.value) {
    clearInterval(simulationInterval.value)
    simulationInterval.value = undefined
  }
}

// 更新GPS位置（根据路径类型）
const updateGPSPosition = () => {
  const step = pathStep.value
  const time = step * 0.1

  switch (pathType.value) {
    case '
- **文件**: webview/components/test/GPSWidgetTest.vue
- **行号**: 155
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/test/GPSWidgetTest.vue 第 196 行发现可疑模式: ':
      // 直线移动（向东北）
      currentLat.value += 0.0001
      currentLng.value += 0.0001
      currentAlt.value += Math.sin(time) * 2
      break

    case '
- **文件**: webview/components/test/GPSWidgetTest.vue
- **行号**: 196
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/test/GPSWidgetTest.vue 第 203 行发现可疑模式: ':
      // 圆形路径
      const centerLat = 39.9042
      const centerLng = 116.4074
      currentLat.value = centerLat + pathRadius.value * Math.cos(time)
      currentLng.value = centerLng + pathRadius.value * Math.sin(time)
      currentAlt.value = 50 + Math.sin(time * 2) * 10
      break

    case '
- **文件**: webview/components/test/GPSWidgetTest.vue
- **行号**: 203
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/test/GPSWidgetTest.vue 第 212 行发现可疑模式: ':
      // 随机游走
      randomDirection.value += (Math.random() - 0.5) * 0.5
      const speed = 0.00005
      currentLat.value += Math.cos(randomDirection.value) * speed
      currentLng.value += Math.sin(randomDirection.value) * speed
      currentAlt.value += (Math.random() - 0.5) * 5
      break

    case '
- **文件**: webview/components/test/GPSWidgetTest.vue
- **行号**: 212
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/test/GPSWidgetTest.vue 第 221 行发现可疑模式: ':
      // 8字形路径
      currentLat.value = 39.9042 + pathRadius.value * Math.sin(time)
      currentLng.value = 116.4074 + pathRadius.value * Math.sin(time * 2)
      currentAlt.value = 50 + Math.sin(time * 3) * 15
      break
  }

  // 限制高度范围
  currentAlt.value = Math.max(-100, Math.min(9000, currentAlt.value))
}

// 更新模拟数据集
const updateMockDatasets = () => {
  mockDatasets.value[0].value = currentLat.value
  mockDatasets.value[1].value = currentLng.value
  mockDatasets.value[2].value = currentAlt.value
}

// 跳转到预设位置
const jumpToLocation = (location: any) => {
  currentLat.value = location.lat
  currentLng.value = location.lng
  currentAlt.value = location.alt
  updateMockDatasets()
  pathStep.value = 0
}

// 重置位置
const resetPosition = () => {
  jumpToLocation(presetLocations[0]) // 重置到北京
}

// 生成随机路径
const generateRandomPath = () => {
  // 在当前位置周围生成随机路径
  const pathTypes: Array<'
- **文件**: webview/components/test/GPSWidgetTest.vue
- **行号**: 221
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/test/GPSWidgetTest.vue 第 257 行发现可疑模式: ']
  pathType.value = pathTypes[Math.floor(Math.random() * pathTypes.length)]
  
  // 随机调整路径参数
  pathRadius.value = 0.0005 + Math.random() * 0.002
  simulationSpeed.value = 1 + Math.random() * 4
  
  console.log(`生成${pathType.value}路径，半径：${pathRadius.value.toFixed(6)}，速度：${simulationSpeed.value.toFixed(1)}Hz`)
}

// 事件处理
const handlePositionUpdate = (position: GPSPosition) => {
  console.log('
- **文件**: webview/components/test/GPSWidgetTest.vue
- **行号**: 257
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/test/Plot3DWidgetTest.vue 第 471 行发现可疑模式: ${currentX.value.toFixed(2)}
- **文件**: webview/components/test/Plot3DWidgetTest.vue
- **行号**: 471
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/test/Plot3DWidgetTest.vue 第 471 行发现可疑模式: ${currentY.value.toFixed(2)}
- **文件**: webview/components/test/Plot3DWidgetTest.vue
- **行号**: 471
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/test/Plot3DWidgetTest.vue 第 471 行发现可疑模式: ${currentZ.value.toFixed(2)}
- **文件**: webview/components/test/Plot3DWidgetTest.vue
- **行号**: 471
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/test/Plot3DWidgetTest.vue 第 213 行发现可疑模式: ',
    widget: WidgetType.Plot3D,
    graph: true,
    log: true,
    led: false,
    alarm: false,
    fft: false
  }
])

// 开始数据模拟
const startSimulation = () => {
  if (isSimulating.value) return

  isSimulating.value = true
  timeStep.value = 0
  generationCount.value = 0

  simulationInterval.value = setInterval(() => {
    generate3DPoint()
    updateMockDatasets()
    timeStep.value += 1 / simulationSpeed.value
    generationCount.value++
  }, 1000 / simulationSpeed.value)
}

// 停止数据模拟
const stopSimulation = () => {
  isSimulating.value = false
  if (simulationInterval.value) {
    clearInterval(simulationInterval.value)
    simulationInterval.value = undefined
  }
}

// 生成3D数据点
const generate3DPoint = () => {
  const t = timeStep.value

  switch (dataType.value) {
    case '
- **文件**: webview/components/test/Plot3DWidgetTest.vue
- **行号**: 213
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/test/Plot3DWidgetTest.vue 第 260 行发现可疑模式: ':
      // 三维正弦波
      currentX.value = paramX.amplitude * Math.sin(t * paramX.frequency)
      currentY.value = paramY.amplitude * Math.sin(t * paramY.frequency + Math.PI/3)
      currentZ.value = paramZ.amplitude * Math.sin(t * paramZ.frequency + Math.PI*2/3)
      break

    case '
- **文件**: webview/components/test/Plot3DWidgetTest.vue
- **行号**: 260
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/test/Plot3DWidgetTest.vue 第 267 行发现可疑模式: ':
      // 随机游走
      currentX.value += (Math.random() - 0.5) * 0.2
      currentY.value += (Math.random() - 0.5) * 0.2
      currentZ.value += (Math.random() - 0.5) * 0.1
      break

    case '
- **文件**: webview/components/test/Plot3DWidgetTest.vue
- **行号**: 267
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/test/Plot3DWidgetTest.vue 第 274 行发现可疑模式: ':
      // 洛伦兹吸引子
      const { sigma, rho, beta, dt } = lorenzParams.value
      const dx = sigma * (lorenzParams.value.y - lorenzParams.value.x) * dt
      const dy = (lorenzParams.value.x * (rho - lorenzParams.value.z) - lorenzParams.value.y) * dt
      const dz = (lorenzParams.value.x * lorenzParams.value.y - beta * lorenzParams.value.z) * dt
      
      lorenzParams.value.x += dx
      lorenzParams.value.y += dy
      lorenzParams.value.z += dz
      
      currentX.value = lorenzParams.value.x * 0.1
      currentY.value = lorenzParams.value.y * 0.1
      currentZ.value = lorenzParams.value.z * 0.1
      break

    case '
- **文件**: webview/components/test/Plot3DWidgetTest.vue
- **行号**: 274
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/test/Plot3DWidgetTest.vue 第 297 行发现可疑模式: ':
      // 8字形
      currentX.value = paramX.amplitude * Math.sin(t * paramX.frequency)
      currentY.value = paramY.amplitude * Math.sin(t * paramY.frequency * 2)
      currentZ.value = paramZ.amplitude * Math.cos(t * paramZ.frequency)
      break
  }
}

// 更新模拟数据集
const updateMockDatasets = () => {
  mockDatasets.value[0].value = currentX.value
  mockDatasets.value[1].value = currentY.value
  mockDatasets.value[2].value = currentZ.value
  currentDataPoints.value++
}

// 清除数据
const clearData = () => {
  stopSimulation()
  timeStep.value = 0
  generationCount.value = 0
  currentDataPoints.value = 0
  currentX.value = 0
  currentY.value = 0
  currentZ.value = 0
  updateMockDatasets()
}

// 生成测试数据
const generateTestData = () => {
  const testDataCount = 200
  
  for (let i = 0; i < testDataCount; i++) {
    timeStep.value = i * 0.1
    generate3DPoint()
    updateMockDatasets()
    
    // 模拟延迟以观察生成过程
    if (i % 10 === 0) {
      setTimeout(() => {}, 10)
    }
  }
  
  generationCount.value += testDataCount
  currentDataPoints.value += testDataCount
}

// 加载预设数据
const loadPresetData = (presetType: string) => {
  clearData()
  
  const points: Point3D[] = []
  const count = 100
  
  switch (presetType) {
    case '
- **文件**: webview/components/test/Plot3DWidgetTest.vue
- **行号**: 297
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/test/Plot3DWidgetTest.vue 第 353 行发现可疑模式: ':
      // 立方体边框
      for (let i = 0; i < count; i++) {
        const t = i / count * 8 * Math.PI
        if (i < count / 8) {
          points.push({ x: Math.cos(t), y: -1, z: Math.sin(t) })
        } else if (i < count / 4) {
          points.push({ x: 1, y: Math.cos(t), z: Math.sin(t) })
        } else if (i < 3 * count / 8) {
          points.push({ x: Math.cos(t), y: 1, z: Math.sin(t) })
        } else {
          points.push({ x: -1, y: Math.cos(t), z: Math.sin(t) })
        }
      }
      break
      
    case '
- **文件**: webview/components/test/Plot3DWidgetTest.vue
- **行号**: 353
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/test/Plot3DWidgetTest.vue 第 369 行发现可疑模式: ':
      // 球面
      for (let i = 0; i < count; i++) {
        const phi = Math.acos(1 - 2 * i / count)
        const theta = Math.PI * (1 + Math.sqrt(5)) * i
        points.push({
          x: Math.sin(phi) * Math.cos(theta),
          y: Math.sin(phi) * Math.sin(theta),
          z: Math.cos(phi)
        })
      }
      break
      
    case '
- **文件**: webview/components/test/Plot3DWidgetTest.vue
- **行号**: 369
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/test/Plot3DWidgetTest.vue 第 382 行发现可疑模式: ':
      // 环形
      for (let i = 0; i < count; i++) {
        const u = (i / count) * 2 * Math.PI
        const v = ((i * 7) % count / count) * 2 * Math.PI
        const R = 2, r = 0.5
        points.push({
          x: (R + r * Math.cos(v)) * Math.cos(u),
          y: (R + r * Math.cos(v)) * Math.sin(u),
          z: r * Math.sin(v)
        })
      }
      break
      
    case '
- **文件**: webview/components/test/Plot3DWidgetTest.vue
- **行号**: 382
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/test/Plot3DWidgetTest.vue 第 396 行发现可疑模式: ':
      // DNA双螺旋
      for (let i = 0; i < count; i++) {
        const t = i / count * 10 * Math.PI
        const radius = 1
        points.push({
          x: radius * Math.cos(t),
          y: radius * Math.sin(t),
          z: t * 0.2
        })
      }
      break
  }
  
  // 模拟逐点生成
  let index = 0
  const addPoint = () => {
    if (index < points.length) {
      const point = points[index]
      currentX.value = point.x
      currentY.value = point.y
      currentZ.value = point.z
      updateMockDatasets()
      index++
      currentDataPoints.value++
      setTimeout(addPoint, 50)
    }
  }
  
  addPoint()
}

// 改变数据类型
const changeDataType = (newType: string) => {
  dataType.value = newType as any
  
  // 重置洛伦兹吸引子参数
  if (dataType.value === '
- **文件**: webview/components/test/Plot3DWidgetTest.vue
- **行号**: 396
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/AccelerometerWidget.vue 第 80 行发现可疑模式: ${sphereSize}
- **文件**: webview/components/widgets/AccelerometerWidget.vue
- **行号**: 80
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/AccelerometerWidget.vue 第 80 行发现可疑模式: ${sphereSize}
- **文件**: webview/components/widgets/AccelerometerWidget.vue
- **行号**: 80
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/AccelerometerWidget.vue 第 170 行发现可疑模式: ${Math.abs(xPercent)}
- **文件**: webview/components/widgets/AccelerometerWidget.vue
- **行号**: 170
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/AccelerometerWidget.vue 第 172 行发现可疑模式: ${50 + xPercent}
- **文件**: webview/components/widgets/AccelerometerWidget.vue
- **行号**: 172
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/AccelerometerWidget.vue 第 186 行发现可疑模式: ${Math.abs(yPercent)}
- **文件**: webview/components/widgets/AccelerometerWidget.vue
- **行号**: 186
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/AccelerometerWidget.vue 第 188 行发现可疑模式: ${50 + yPercent}
- **文件**: webview/components/widgets/AccelerometerWidget.vue
- **行号**: 188
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/AccelerometerWidget.vue 第 202 行发现可疑模式: ${Math.abs(zPercent)}
- **文件**: webview/components/widgets/AccelerometerWidget.vue
- **行号**: 202
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/AccelerometerWidget.vue 第 204 行发现可疑模式: ${50 + zPercent}
- **文件**: webview/components/widgets/AccelerometerWidget.vue
- **行号**: 204
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/AccelerometerWidget.vue 第 381 行发现可疑模式: ${hue}
- **文件**: webview/components/widgets/AccelerometerWidget.vue
- **行号**: 381
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/AccelerometerWidget.vue 第 393 行发现可疑模式: ${vectorEndX.value}
- **文件**: webview/components/widgets/AccelerometerWidget.vue
- **行号**: 393
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/AccelerometerWidget.vue 第 393 行发现可疑模式: ${vectorEndY.value}
- **文件**: webview/components/widgets/AccelerometerWidget.vue
- **行号**: 393
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/AccelerometerWidget.vue 第 393 行发现可疑模式: ${tip1X}
- **文件**: webview/components/widgets/AccelerometerWidget.vue
- **行号**: 393
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/AccelerometerWidget.vue 第 393 行发现可疑模式: ${tip1Y}
- **文件**: webview/components/widgets/AccelerometerWidget.vue
- **行号**: 393
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/AccelerometerWidget.vue 第 393 行发现可疑模式: ${tip2X}
- **文件**: webview/components/widgets/AccelerometerWidget.vue
- **行号**: 393
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/AccelerometerWidget.vue 第 393 行发现可疑模式: ${tip2Y}
- **文件**: webview/components/widgets/AccelerometerWidget.vue
- **行号**: 393
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/AccelerometerWidget.vue 第 102 行发现可疑模式: "sphereCenter - sphereRadius + 15"
- **文件**: webview/components/widgets/AccelerometerWidget.vue
- **行号**: 102
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/AccelerometerWidget.vue 第 104 行发现可疑模式: "sphereCenter + sphereRadius - 15"
- **文件**: webview/components/widgets/AccelerometerWidget.vue
- **行号**: 104
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/AccelerometerWidget.vue 第 109 行发现可疑模式: "sphereCenter + sphereRadius - 10"
- **文件**: webview/components/widgets/AccelerometerWidget.vue
- **行号**: 109
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/AccelerometerWidget.vue 第 117 行发现可疑模式: "sphereCenter - sphereRadius + 15"
- **文件**: webview/components/widgets/AccelerometerWidget.vue
- **行号**: 117
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/AccelerometerWidget.vue 第 119 行发现可疑模式: "sphereCenter + sphereRadius - 15"
- **文件**: webview/components/widgets/AccelerometerWidget.vue
- **行号**: 119
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/AccelerometerWidget.vue 第 123 行发现可疑模式: "sphereCenter + 5"
- **文件**: webview/components/widgets/AccelerometerWidget.vue
- **行号**: 123
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/AccelerometerWidget.vue 第 124 行发现可疑模式: "sphereCenter - sphereRadius + 20"
- **文件**: webview/components/widgets/AccelerometerWidget.vue
- **行号**: 124
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/AccelerometerWidget.vue 第 169 行发现可疑模式: "{ 
                  width: `${Math.abs(xPercent)}%`,
                  backgroundColor: xColor,
                  marginLeft: xPercent < 0 ? `${50 + xPercent}%` : '
- **文件**: webview/components/widgets/AccelerometerWidget.vue
- **行号**: 169
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/AccelerometerWidget.vue 第 185 行发现可疑模式: "{ 
                  width: `${Math.abs(yPercent)}%`,
                  backgroundColor: yColor,
                  marginLeft: yPercent < 0 ? `${50 + yPercent}%` : '
- **文件**: webview/components/widgets/AccelerometerWidget.vue
- **行号**: 185
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/AccelerometerWidget.vue 第 201 行发现可疑模式: "{ 
                  width: `${Math.abs(zPercent)}%`,
                  backgroundColor: zColor,
                  marginLeft: zPercent < 0 ? `${50 + zPercent}%` : '
- **文件**: webview/components/widgets/AccelerometerWidget.vue
- **行号**: 201
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/AccelerometerWidget.vue 第 324 行发现可疑模式: ');
});

const hasData = computed(() => {
  return accelerometerData.value.x !== undefined || 
         accelerometerData.value.y !== undefined || 
         accelerometerData.value.z !== undefined;
});

const sphereSize = computed(() => {
  return Math.min(props.size, 200);
});

const sphereCenter = computed(() => {
  return sphereSize.value / 2;
});

const sphereRadius = computed(() => {
  return sphereSize.value / 2 - 20;
});

const updateRate = computed(() => {
  if (lastFrameTime.value === 0) return 0;
  const now = Date.now();
  const timeDiff = now - lastFrameTime.value;
  return timeDiff > 0 ? Math.round(1000 / timeDiff) : 0;
});

// 计算合成加速度
const totalAcceleration = computed(() => {
  const { x, y, z } = accelerometerData.value;
  return Math.sqrt(x * x + y * y + z * z);
});

// 计算倾斜角度
const tiltAngle = computed(() => {
  const { x, y, z } = accelerometerData.value;
  if (z === 0) return 90;
  return Math.abs(Math.atan2(Math.sqrt(x * x + y * y), z) * 180 / Math.PI);
});

// 向量显示计算
const vectorEndX = computed(() => {
  const x = accelerometerData.value.x;
  const scale = (sphereRadius.value - 20) / props.maxAcceleration;
  return sphereCenter.value + x * scale;
});

const vectorEndY = computed(() => {
  const y = accelerometerData.value.y;
  const scale = (sphereRadius.value - 20) / props.maxAcceleration;
  return sphereCenter.value - y * scale; // Y轴反向
});

const vectorColor = computed(() => {
  const intensity = Math.min(totalAcceleration.value / props.maxAcceleration, 1);
  const hue = (1 - intensity) * 120; // 从绿色(120)到红色(0)
  return `hsl(${hue}, 70%, 50%)`;
});

const arrowPoints = computed(() => {
  const angle = Math.atan2(vectorEndY.value - sphereCenter.value, vectorEndX.value - sphereCenter.value);
  const arrowSize = 8;
  
  const tip1X = vectorEndX.value - arrowSize * Math.cos(angle - Math.PI / 6);
  const tip1Y = vectorEndY.value - arrowSize * Math.sin(angle - Math.PI / 6);
  const tip2X = vectorEndX.value - arrowSize * Math.cos(angle + Math.PI / 6);
  const tip2Y = vectorEndY.value - arrowSize * Math.sin(angle + Math.PI / 6);
  
  return `${vectorEndX.value},${vectorEndY.value} ${tip1X},${tip1Y} ${tip2X},${tip2Y}`;
});

// 条形图百分比计算
const xPercent = computed(() => {
  return (accelerometerData.value.x / props.maxAcceleration) * 50;
});

const yPercent = computed(() => {
  return (accelerometerData.value.y / props.maxAcceleration) * 50;
});

const zPercent = computed(() => {
  return (accelerometerData.value.z / props.maxAcceleration) * 50;
});

// 轴颜色
const xColor = computed(() => '
- **文件**: webview/components/widgets/AccelerometerWidget.vue
- **行号**: 324
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/AccelerometerWidget.vue 第 428 行发现可疑模式: ';
    isLoading.value = false;
  }
};

const updateAcceleration = (x: number, y: number, z: number) => {
  if (isPaused.value) return;
  
  if (props.smoothing) {
    // 简单的低通滤波
    const alpha = 0.8;
    accelerometerData.value.x = alpha * x + (1 - alpha) * accelerometerData.value.x;
    accelerometerData.value.y = alpha * y + (1 - alpha) * accelerometerData.value.y;
    accelerometerData.value.z = alpha * z + (1 - alpha) * accelerometerData.value.z;
  } else {
    accelerometerData.value.x = x;
    accelerometerData.value.y = y;
    accelerometerData.value.z = z;
  }
  
  lastUpdate.value = Date.now();
  recordFrame();
};

const recordFrame = () => {
  frameCount.value++;
  const now = Date.now();
  
  if (lastFrameTime.value > 0) {
    const timeDiff = now - lastFrameTime.value;
    if (timeDiff > 0) {
      performanceStore.recordFrame();
    }
  }
  
  lastFrameTime.value = now;
};

const togglePause = () => {
  isPaused.value = !isPaused.value;
};

const resetAccelerometer = () => {
  accelerometerData.value = { x: 0, y: 0, z: 1 };
};

const toggleAxes = () => {
  showAxes.value = !showAxes.value;
};

const handleModeChange = (command: string) => {
  displayMode.value = command as '
- **文件**: webview/components/widgets/AccelerometerWidget.vue
- **行号**: 428
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/AccelerometerWidget.vue 第 491 行发现可疑模式: ');
};

const handleResize = (size: { width: number; height: number }) => {
  // 加速度计会根据容器大小自动调整
};

const handleSettingsChanged = (config: WidgetConfig) => {
  Object.assign(props.config, config);
  initializeAccelerometer();
};

// 模拟数据更新（用于演示）
const simulateDataUpdate = () => {
  let time = 0;
  
  setInterval(() => {
    if (!isPaused.value && props.realtime) {
      time += 0.1;
      
      // 模拟倾斜运动
      const x = Math.sin(time) * 0.5 + (Math.random() - 0.5) * 0.1;
      const y = Math.cos(time * 0.7) * 0.3 + (Math.random() - 0.5) * 0.1;
      const z = 1 - Math.abs(x) * 0.5 - Math.abs(y) * 0.3 + (Math.random() - 0.5) * 0.05;
      
      updateAcceleration(x, y, z);
    }
  }, props.updateInterval);
};

// 生命周期
onMounted(async () => {
  await nextTick();
  await initializeAccelerometer();
  
  // 开始模拟数据更新（演示用）
  if (props.realtime) {
    simulateDataUpdate();
  }
});

onUnmounted(() => {
  // 清理资源
});

// 监听器
watch(() => props.datasets, () => {
  initializeAccelerometer();
}, { deep: true });

// 暴露组件方法
defineExpose({
  updateAcceleration,
  resetAccelerometer,
  togglePause,
  getAcceleration: () => accelerometerData.value
});
</script>

<style scoped>
.accelerometer-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 250px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.accelerometer-3d {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.accelerometer-sphere {
  display: flex;
  align-items: center;
  justify-content: center;
}

.sphere-svg {
  max-width: 100%;
  max-height: 100%;
}

.sphere-outer {
  fill: none;
  stroke: var(--el-border-color);
  stroke-width: 2;
}

.sphere-inner {
  fill: var(--el-bg-color-page);
  stroke: var(--el-border-color-light);
  stroke-width: 1;
  opacity: 0.3;
}

.axes-group .axis-x,
.axes-group .axis-y {
  stroke-width: 1;
  opacity: 0.6;
}

.axis-x {
  stroke: #f56c6c;
}

.axis-y {
  stroke: #67c23a;
}

.axis-label {
  fill: var(--el-text-color-secondary);
  font-size: 12px;
  font-weight: bold;
}

.vector-line {
  stroke-width: 3;
}

.vector-arrow {
  stroke: none;
}

.vector-point {
  stroke: none;
}

.accelerometer-bars {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.axis-bars {
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.axis-bar-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.axis-label {
  width: 20px;
  font-weight: bold;
  text-align: center;
}

.bar-background {
  flex: 1;
  height: 20px;
  background: var(--el-bg-color-page);
  border: 1px solid var(--el-border-color-light);
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 8px;
  transition: all 0.2s ease;
  min-width: 2px;
}

.axis-value {
  width: 80px;
  text-align: right;
  font-family: '
- **文件**: webview/components/widgets/AccelerometerWidget.vue
- **行号**: 491
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/BarWidget.vue 第 230 行发现可疑模式: ${minValue.value.toFixed(2)}
- **文件**: webview/components/widgets/BarWidget.vue
- **行号**: 230
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/BarWidget.vue 第 230 行发现可疑模式: ${maxValue.value.toFixed(2)}
- **文件**: webview/components/widgets/BarWidget.vue
- **行号**: 230
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/BarWidget.vue 第 281 行发现可疑模式: ${value.toFixed(3)}
- **文件**: webview/components/widgets/BarWidget.vue
- **行号**: 281
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/BarWidget.vue 第 281 行发现可疑模式: ${unit}
- **文件**: webview/components/widgets/BarWidget.vue
- **行号**: 281
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/BarWidget.vue 第 372 行发现可疑模式: ${index + 1}
- **文件**: webview/components/widgets/BarWidget.vue
- **行号**: 372
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/BarWidget.vue 第 363 行发现可疑模式: ';
    isLoading.value = false;
  }
};

const setupDataStructure = () => {
  // 初始化示例数据
  if (chartData.value.length === 0 && props.datasets.length > 0) {
    chartData.value = props.datasets.map((dataset, index) => ({
      label: dataset.title || `项目${index + 1}`,
      value: Math.random() * 100,
      unit: dataset.unit
    }));
  }
  
  colors.value = generateColors(chartData.value.length);
};

const generateColors = (count: number): string[] => {
  const baseColors = [
    '
- **文件**: webview/components/widgets/BarWidget.vue
- **行号**: 363
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/BarWidget.vue 第 385 行发现可疑模式: '
  ];
  
  return Array.from({ length: count }, (_, i) => {
    const color = baseColors[i % baseColors.length];
    return color + '
- **文件**: webview/components/widgets/BarWidget.vue
- **行号**: 385
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/BarWidget.vue 第 446 行发现可疑模式: ', error);
  }
};

const recordFrame = () => {
  frameCount.value++;
  const now = Date.now();
  
  if (lastFrameTime.value > 0) {
    const timeDiff = now - lastFrameTime.value;
    if (timeDiff > 0) {
      performanceStore.recordFrame();
    }
  }
  
  lastFrameTime.value = now;
};

const togglePause = () => {
  isPaused.value = !isPaused.value;
};

const handleSortChange = (command: string) => {
  currentSortMode.value = command as '
- **文件**: webview/components/widgets/BarWidget.vue
- **行号**: 446
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/BarWidget.vue 第 502 行发现可疑模式: ', event);
};

// 模拟数据更新（用于演示）
const simulateDataUpdate = () => {
  setInterval(() => {
    if (!isPaused.value && props.realtime) {
      // 更新现有数据项的值
      chartData.value.forEach(item => {
        item.value = Math.max(0, item.value + (Math.random() - 0.5) * 20);
      });
      
      updateChart();
    }
  }, props.updateInterval);
};

// 生命周期
onMounted(async () => {
  await nextTick();
  await initializeChart();
  
  // 开始模拟数据更新（演示用）
  if (props.realtime) {
    simulateDataUpdate();
  }
});

onUnmounted(() => {
  if (chart.value) {
    chart.value.destroy();
  }
});

// 监听器
watch(() => props.datasets, () => {
  initializeChart();
}, { deep: true });

watch(() => themeStore.currentTheme, () => {
  if (chart.value) {
    chart.value.options = chartOptions.value;
    chart.value.update();
  }
});

// 暴露组件方法
defineExpose({
  addDataItem,
  updateData,
  togglePause,
  getChart: () => chart.value
});
</script>

<style scoped>
.bar-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 200px;
}

.bar-canvas {
  width: 100% !important;
  height: 100% !important;
}

.bar-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-secondary);
}

.loading-icon {
  font-size: 24px;
  animation: spin 1s linear infinite;
}

.data-info-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  border-radius: 4px;
  padding: 8px;
  color: white;
  font-size: 12px;
  pointer-events: none;
}

.data-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.info-label {
  opacity: 0.8;
}

.info-value {
  font-weight: 500;
}

.bar-stats {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-family: '
- **文件**: webview/components/widgets/BarWidget.vue
- **行号**: 502
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的Command Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/BarWidget.vue 第 310 行发现可疑模式: function(
- **文件**: webview/components/widgets/BarWidget.vue
- **行号**: 310
- **CWE ID**: CWE-78
- **建议**: 避免执行外部命令，使用安全的API替代

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/CompassWidget.vue 第 69 行发现可疑模式: ${compassSize}
- **文件**: webview/components/widgets/CompassWidget.vue
- **行号**: 69
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/CompassWidget.vue 第 69 行发现可疑模式: ${compassSize}
- **文件**: webview/components/widgets/CompassWidget.vue
- **行号**: 69
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/CompassWidget.vue 第 123 行发现可疑模式: ${currentHeading}
- **文件**: webview/components/widgets/CompassWidget.vue
- **行号**: 123
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/CompassWidget.vue 第 123 行发现可疑模式: ${center}
- **文件**: webview/components/widgets/CompassWidget.vue
- **行号**: 123
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/CompassWidget.vue 第 123 行发现可疑模式: ${center}
- **文件**: webview/components/widgets/CompassWidget.vue
- **行号**: 123
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/CompassWidget.vue 第 305 行发现可疑模式: ${cardinalDirection.value}
- **文件**: webview/components/widgets/CompassWidget.vue
- **行号**: 305
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/CompassWidget.vue 第 305 行发现可疑模式: ${currentHeading.value.toFixed(0)}
- **文件**: webview/components/widgets/CompassWidget.vue
- **行号**: 305
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/CompassWidget.vue 第 357 行发现可疑模式: ${center.value}
- **文件**: webview/components/widgets/CompassWidget.vue
- **行号**: 357
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/CompassWidget.vue 第 357 行发现可疑模式: ${center.value - needleLength}
- **文件**: webview/components/widgets/CompassWidget.vue
- **行号**: 357
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/CompassWidget.vue 第 358 行发现可疑模式: ${center.value - needleWidth}
- **文件**: webview/components/widgets/CompassWidget.vue
- **行号**: 358
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/CompassWidget.vue 第 358 行发现可疑模式: ${center.value + 10}
- **文件**: webview/components/widgets/CompassWidget.vue
- **行号**: 358
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/CompassWidget.vue 第 359 行发现可疑模式: ${center.value + needleWidth}
- **文件**: webview/components/widgets/CompassWidget.vue
- **行号**: 359
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/CompassWidget.vue 第 359 行发现可疑模式: ${center.value + 10}
- **文件**: webview/components/widgets/CompassWidget.vue
- **行号**: 359
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/CompassWidget.vue 第 366 行发现可疑模式: ${center.value}
- **文件**: webview/components/widgets/CompassWidget.vue
- **行号**: 366
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/CompassWidget.vue 第 366 行发现可疑模式: ${center.value + needleLength}
- **文件**: webview/components/widgets/CompassWidget.vue
- **行号**: 366
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/CompassWidget.vue 第 367 行发现可疑模式: ${center.value - needleWidth}
- **文件**: webview/components/widgets/CompassWidget.vue
- **行号**: 367
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/CompassWidget.vue 第 367 行发现可疑模式: ${center.value - 10}
- **文件**: webview/components/widgets/CompassWidget.vue
- **行号**: 367
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/CompassWidget.vue 第 368 行发现可疑模式: ${center.value + needleWidth}
- **文件**: webview/components/widgets/CompassWidget.vue
- **行号**: 368
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/CompassWidget.vue 第 368 行发现可疑模式: ${center.value - 10}
- **文件**: webview/components/widgets/CompassWidget.vue
- **行号**: 368
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/CompassWidget.vue 第 148 行发现可疑模式: "center + 40"
- **文件**: webview/components/widgets/CompassWidget.vue
- **行号**: 148
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/CompassWidget.vue 第 299 行发现可疑模式: '];
  const index = Math.round(currentHeading.value / 22.5) % 16;
  return directions[index];
});

const headingText = computed(() => {
  return `${cardinalDirection.value} ${currentHeading.value.toFixed(0)}°`;
});

// 刻度线计算
const ticks = computed(() => {
  const ticksArray = [];
  
  for (let i = 0; i < 360; i += 15) {
    const radian = (i - 90) * Math.PI / 180;
    const isMajor = i % 30 === 0;
    const tickLength = isMajor ? 15 : 8;
    
    const outerRadius = radius.value;
    const innerRadius = outerRadius - tickLength;
    const labelRadius = outerRadius - 25;
    const degreeRadius = outerRadius - 35;
    
    const x1 = center.value + Math.cos(radian) * outerRadius;
    const y1 = center.value + Math.sin(radian) * outerRadius;
    const x2 = center.value + Math.cos(radian) * innerRadius;
    const y2 = center.value + Math.sin(radian) * innerRadius;
    
    const labelX = center.value + Math.cos(radian) * labelRadius;
    const labelY = center.value + Math.sin(radian) * labelRadius;
    
    const degreeX = center.value + Math.cos(radian) * degreeRadius;
    const degreeY = center.value + Math.sin(radian) * degreeRadius;
    
    // 主要方位标签
    const cardinalLabels: { [key: number]: string } = {
      0: '
- **文件**: webview/components/widgets/CompassWidget.vue
- **行号**: 299
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/CompassWidget.vue 第 336 行发现可疑模式: '
    };
    
    ticksArray.push({
      x1, y1, x2, y2,
      labelX, labelY,
      degreeX, degreeY,
      major: isMajor,
      label: cardinalLabels[i],
      degree: i
    });
  }
  
  return ticksArray;
});

// 指针形状
const northNeedlePoints = computed(() => {
  const needleLength = radius.value - 40;
  const needleWidth = 8;
  
  return `${center.value},${center.value - needleLength} 
          ${center.value - needleWidth},${center.value + 10} 
          ${center.value + needleWidth},${center.value + 10}`;
});

const southNeedlePoints = computed(() => {
  const needleLength = radius.value - 40;
  const needleWidth = 8;
  
  return `${center.value},${center.value + needleLength} 
          ${center.value - needleWidth},${center.value - 10} 
          ${center.value + needleWidth},${center.value - 10}`;
});

// 方法
const initializeCompass = async () => {
  try {
    isLoading.value = true;
    
    // 初始化指南针数据
    if (props.datasets.length > 0) {
      const dataset = props.datasets[0];
      if (dataset.value !== undefined) {
        updateHeading(Number(dataset.value));
      }
    }
    
    isLoading.value = false;
    console.log('
- **文件**: webview/components/widgets/CompassWidget.vue
- **行号**: 336
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/CompassWidget.vue 第 390 行发现可疑模式: ';
    isLoading.value = false;
  }
};

const updateHeading = (newHeading: number) => {
  if (isPaused.value) return;
  
  // 标准化角度到0-360度
  newHeading = ((newHeading % 360) + 360) % 360;
  
  targetHeading.value = newHeading;
  
  if (props.smoothing) {
    animateToHeading(newHeading);
  } else {
    currentHeading.value = newHeading;
  }
  
  compassData.value.heading = newHeading;
  
  lastUpdate.value = Date.now();
  recordFrame();
};

const animateToHeading = (targetAngle: number) => {
  const startAngle = currentHeading.value;
  let angleDiff = targetAngle - startAngle;
  
  // 处理角度跨越360度的情况
  if (angleDiff > 180) {
    angleDiff -= 360;
  } else if (angleDiff < -180) {
    angleDiff += 360;
  }
  
  const animationDuration = 300; // 毫秒
  const startTime = Date.now();
  
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / animationDuration, 1);
    
    // 使用缓动函数
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    
    currentHeading.value = startAngle + angleDiff * easedProgress;
    
    // 标准化角度
    currentHeading.value = ((currentHeading.value % 360) + 360) % 360;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  
  animate();
};

const recordFrame = () => {
  frameCount.value++;
  const now = Date.now();
  
  if (lastFrameTime.value > 0) {
    const timeDiff = now - lastFrameTime.value;
    if (timeDiff > 0) {
      performanceStore.recordFrame();
    }
  }
  
  lastFrameTime.value = now;
};

const togglePause = () => {
  isPaused.value = !isPaused.value;
};

const resetCompass = () => {
  currentHeading.value = 0;
  targetHeading.value = 0;
  compassData.value.heading = 0;
};

const handleModeChange = (command: string) => {
  displayMode.value = command as '
- **文件**: webview/components/widgets/CompassWidget.vue
- **行号**: 390
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/CompassWidget.vue 第 486 行发现可疑模式: ');
};

const handleResize = (size: { width: number; height: number }) => {
  // 指南针会根据容器大小自动调整
};

const handleSettingsChanged = (config: WidgetConfig) => {
  Object.assign(props.config, config);
  initializeCompass();
};

// 模拟数据更新（用于演示）
const simulateDataUpdate = () => {
  let direction = 1;
  let speed = 2;
  
  setInterval(() => {
    if (!isPaused.value && props.realtime) {
      // 模拟缓慢转动
      targetHeading.value += direction * speed;
      
      // 随机改变方向
      if (Math.random() < 0.02) {
        direction *= -1;
        speed = Math.random() * 3 + 1;
      }
      
      updateHeading(targetHeading.value);
    }
  }, props.updateInterval);
};

// 生命周期
onMounted(async () => {
  await nextTick();
  await initializeCompass();
  
  // 开始模拟数据更新（演示用）
  if (props.realtime) {
    simulateDataUpdate();
  }
});

onUnmounted(() => {
  // 清理资源
});

// 监听器
watch(() => props.datasets, () => {
  initializeCompass();
}, { deep: true });

// 暴露组件方法
defineExpose({
  updateHeading,
  resetCompass,
  togglePause,
  getCurrentHeading: () => currentHeading.value
});
</script>

<style scoped>
.compass-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.compass-display {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.compass-svg {
  max-width: 100%;
  max-height: 100%;
}

.compass-outer-ring {
  fill: none;
  stroke: var(--el-border-color);
  stroke-width: 2;
}

.compass-inner-ring {
  fill: var(--el-bg-color);
  stroke: var(--el-border-color-light);
  stroke-width: 1;
}

.compass-major-tick {
  stroke: var(--el-text-color-regular);
  stroke-width: 2;
}

.compass-minor-tick {
  stroke: var(--el-text-color-secondary);
  stroke-width: 1;
}

.compass-cardinal-label {
  fill: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: bold;
}

.compass-degree-label {
  fill: var(--el-text-color-secondary);
  font-size: 10px;
}

.compass-north-needle {
  fill: var(--el-color-danger);
  stroke: var(--el-color-danger-dark-2);
  stroke-width: 1;
}

.compass-south-needle {
  fill: var(--el-color-info-light-5);
  stroke: var(--el-color-info);
  stroke-width: 1;
}

.compass-center-dot {
  fill: var(--el-color-primary);
  stroke: var(--el-color-primary-dark-2);
  stroke-width: 1;
}

.compass-heading-text {
  fill: var(--el-text-color-primary);
  font-size: 12px;
  font-weight: 500;
}

.compass-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-secondary);
}

.loading-icon {
  font-size: 24px;
  animation: spin 1s linear infinite;
}

.compass-info {
  margin-top: 16px;
  width: 100%;
}

.info-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  padding: 8px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 80px;
}

.info-label {
  font-size: 11px;
  color: var(--el-text-color-secondary);
}

.info-value {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  font-family: '
- **文件**: webview/components/widgets/CompassWidget.vue
- **行号**: 486
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/DataGridWidget.vue 第 465 行发现可疑模式: ${Date.now()}
- **文件**: webview/components/widgets/DataGridWidget.vue
- **行号**: 465
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/DataGridWidget.vue 第 465 行发现可疑模式: ${Math.random().toString(36).substr(2, 9)}
- **文件**: webview/components/widgets/DataGridWidget.vue
- **行号**: 465
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/DataGridWidget.vue 第 636 行发现可疑模式: ${Math.floor(Math.random() * 1000)}
- **文件**: webview/components/widgets/DataGridWidget.vue
- **行号**: 636
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/DataGridWidget.vue 第 369 行发现可疑模式: ';
});

// 动态生成列配置
const dataColumns = computed(() => {
  if (props.datasets.length === 0) return [];
  
  const columns: DataColumn[] = [];
  
  props.datasets.forEach(dataset => {
    const column: DataColumn = {
      key: dataset.widget || dataset.title.toLowerCase().replace(/\s+/g, '
- **文件**: webview/components/widgets/DataGridWidget.vue
- **行号**: 369
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/DataGridWidget.vue 第 393 行发现可疑模式: ';
      column.width = 150;
      column.min = dataset.min || 0;
      column.max = dataset.max || 100;
    }
    
    columns.push(column);
  });
  
  return columns;
});

// 分页显示数据
const displayData = computed(() => {
  if (!enablePagination.value) {
    return rawData.value;
  }
  
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return rawData.value.slice(start, end);
});

// 方法
const initializeDataGrid = async () => {
  try {
    isLoading.value = true;
    
    // 初始化数据结构
    rawData.value = [];
    gridData.value = { rows: [], columns: dataColumns.value };
    
    isLoading.value = false;
    console.log('
- **文件**: webview/components/widgets/DataGridWidget.vue
- **行号**: 393
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/DataGridWidget.vue 第 431 行发现可疑模式: ';
    isLoading.value = false;
  }
};

const addDataRow = (data: { [key: string]: any }) => {
  if (isPaused.value) return;
  
  const newRow: DataRow = {
    id: generateRowId(),
    timestamp: Date.now(),
    ...data
  };
  
  rawData.value.push(newRow);
  
  // 限制行数
  if (rawData.value.length > props.maxRows) {
    rawData.value.shift();
  }
  
  // 更新网格数据
  gridData.value.rows = [...rawData.value];
  
  // 自动滚动到底部
  if (autoScroll.value) {
    scrollToBottom();
  }
  
  lastUpdate.value = Date.now();
  recordFrame();
};

const generateRowId = () => {
  return `row_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const scrollToBottom = () => {
  nextTick(() => {
    if (dataTable.value && dataTable.value.bodyWrapper) {
      const wrapper = dataTable.value.bodyWrapper;
      wrapper.scrollTop = wrapper.scrollHeight;
    }
  });
};

const clearData = () => {
  rawData.value = [];
  gridData.value.rows = [];
  selectedRows.value = [];
  currentPage.value = 1;
};

const recordFrame = () => {
  frameCount.value++;
  const now = Date.now();
  
  if (lastFrameTime.value > 0) {
    const timeDiff = now - lastFrameTime.value;
    if (timeDiff > 0) {
      performanceStore.recordFrame();
    }
  }
  
  lastFrameTime.value = now;
};

const formatTimestamp = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('
- **文件**: webview/components/widgets/DataGridWidget.vue
- **行号**: 431
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/FFTPlotWidget.vue 第 261 行发现可疑模式: ${fftSize.value}
- **文件**: webview/components/widgets/FFTPlotWidget.vue
- **行号**: 261
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/FFTPlotWidget.vue 第 261 行发现可疑模式: ${samplingRate.value}
- **文件**: webview/components/widgets/FFTPlotWidget.vue
- **行号**: 261
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/FFTPlotWidget.vue 第 701 行发现可疑模式: ${(freq / 1000).toFixed(1)}
- **文件**: webview/components/widgets/FFTPlotWidget.vue
- **行号**: 701
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/FFTPlotWidget.vue 第 703 行发现可疑模式: ${freq.toFixed(0)}
- **文件**: webview/components/widgets/FFTPlotWidget.vue
- **行号**: 703
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/FFTPlotWidget.vue 第 707 行发现可疑模式: ${mag.toFixed(1)}
- **文件**: webview/components/widgets/FFTPlotWidget.vue
- **行号**: 707
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/FFTPlotWidget.vue 第 287 行发现可疑模式: ':
      for (let i = 0; i < N; i++) {
        const window = 0.5 * (1 - Math.cos(2 * Math.PI * i / (N - 1)))
        windowed[i] *= window
      }
      break
      
    case '
- **文件**: webview/components/widgets/FFTPlotWidget.vue
- **行号**: 287
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/FFTPlotWidget.vue 第 294 行发现可疑模式: ':
      for (let i = 0; i < N; i++) {
        const window = 0.54 - 0.46 * Math.cos(2 * Math.PI * i / (N - 1))
        windowed[i] *= window
      }
      break
      
    case '
- **文件**: webview/components/widgets/FFTPlotWidget.vue
- **行号**: 294
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/FFTPlotWidget.vue 第 301 行发现可疑模式: ':
      for (let i = 0; i < N; i++) {
        const window = 0.42 - 0.5 * Math.cos(2 * Math.PI * i / (N - 1)) + 
                      0.08 * Math.cos(4 * Math.PI * i / (N - 1))
        windowed[i] *= window
      }
      break
      
    case '
- **文件**: webview/components/widgets/FFTPlotWidget.vue
- **行号**: 301
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/FFTPlotWidget.vue 第 309 行发现可疑模式: ':
    default:
      // 不应用窗函数
      break
  }
  
  return windowed
}

// 执行FFT计算
const performFFT = (inputData: number[]) => {
  if (!fft.value || inputData.length < fftSize.value) return

  const startTime = performance.now()
  
  // 准备输入数据
  const input = inputData.slice(-fftSize.value)
  
  // 应用窗函数
  const windowedData = applyWindowFunction(input)
  
  // 复数输入 (实部, 虚部)
  const complexInput = new Array(fftSize.value * 2)
  for (let i = 0; i < fftSize.value; i++) {
    complexInput[i * 2] = windowedData[i]      // 实部
    complexInput[i * 2 + 1] = 0                // 虚部
  }
  
  // 执行FFT
  const complexOutput = new Array(fftSize.value * 2)
  fft.value.realTransform(complexOutput, complexInput)
  
  // 计算幅度谱
  const halfSize = fftSize.value / 2
  magnitudeData.value = new Array(halfSize)
  
  let peakIdx = 0
  let peakVal = -Infinity
  
  for (let i = 0; i < halfSize; i++) {
    const real = complexOutput[i * 2]
    const imag = complexOutput[i * 2 + 1]
    const magnitude = Math.sqrt(real * real + imag * imag)
    
    // 转换为dB
    const magnitudeDB = magnitude > 1e-12 ? 20 * Math.log10(magnitude) : -100
    magnitudeData.value[i] = magnitudeDB
    
    // 查找峰值
    if (magnitudeDB > peakVal && i > 0) { // 跳过DC分量
      peakVal = magnitudeDB
      peakIdx = i
    }
  }
  
  // 更新峰值信息
  peakMagnitude.value = peakVal
  peakFrequency.value = (peakIdx * samplingRate.value) / fftSize.value
  
  // 记录计算时间
  fftCalculationTime.value = performance.now() - startTime
}

// 绘制频谱图
const drawSpectrum = () => {
  if (!canvasContext.value || !chartCanvas.value) return

  const ctx = canvasContext.value
  const canvas = chartCanvas.value
  const width = canvas.width
  const height = canvas.height
  
  // 清除画布
  ctx.clearRect(0, 0, width, height)
  
  // 设置背景色
  ctx.fillStyle = themeStore.isDark ? '
- **文件**: webview/components/widgets/FFTPlotWidget.vue
- **行号**: 309
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/FFTPlotWidget.vue 第 410 行发现可疑模式: '
  ctx.lineWidth = 1
  ctx.setLineDash([2, 2])
  
  // 垂直网格线（频率）
  const freqStep = maxFrequency.value / 10
  for (let i = 1; i < 10; i++) {
    const x = (i * freqStep / maxFrequency.value) * width
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  
  // 水平网格线（幅度）
  const magStep = (maxY.value - minY.value) / 10
  for (let i = 1; i < 10; i++) {
    const y = height - ((i * magStep) / (maxY.value - minY.value)) * height
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
  
  ctx.setLineDash([])
}

// 绘制频谱曲线
const drawSpectrumCurve = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  if (magnitudeData.value.length === 0) return
  
  ctx.strokeStyle = '
- **文件**: webview/components/widgets/FFTPlotWidget.vue
- **行号**: 410
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/FFTPlotWidget.vue 第 441 行发现可疑模式: '
  ctx.lineWidth = 2
  ctx.beginPath()
  
  const dataLength = magnitudeData.value.length
  
  for (let i = 0; i < dataLength; i++) {
    const freq = (i * samplingRate.value) / fftSize.value
    const magnitude = magnitudeData.value[i]
    
    const x = (freq / maxFrequency.value) * width
    const y = height - ((magnitude - minY.value) / (maxY.value - minY.value)) * height
    
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
  
  ctx.stroke()
}

// 绘制频谱区域填充
const drawSpectrumArea = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  if (magnitudeData.value.length === 0) return
  
  ctx.fillStyle = '
- **文件**: webview/components/widgets/FFTPlotWidget.vue
- **行号**: 441
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/FFTPlotWidget.vue 第 468 行发现可疑模式: '
  ctx.beginPath()
  
  const dataLength = magnitudeData.value.length
  
  // 起始点（底部）
  ctx.moveTo(0, height)
  
  // 频谱曲线
  for (let i = 0; i < dataLength; i++) {
    const freq = (i * samplingRate.value) / fftSize.value
    const magnitude = magnitudeData.value[i]
    
    const x = (freq / maxFrequency.value) * width
    const y = height - ((magnitude - minY.value) / (maxY.value - minY.value)) * height
    
    ctx.lineTo(x, y)
  }
  
  // 结束点（底部）
  ctx.lineTo(width, height)
  ctx.closePath()
  ctx.fill()
}

// 绘制十字线
const drawCrosshairs = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  if (!mousePosition.value) return
  
  const x = (mousePosition.value.freq / maxFrequency.value) * width
  const y = height - ((mousePosition.value.mag - minY.value) / (maxY.value - minY.value)) * height
  
  ctx.strokeStyle = '
- **文件**: webview/components/widgets/FFTPlotWidget.vue
- **行号**: 468
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/FFTPlotWidget.vue 第 523 行发现可疑模式: '
  
  // X轴标签（频率）
  if (showXLabels.value) {
    const freqStep = maxFrequency.value / 10
    for (let i = 0; i <= 10; i++) {
      const freq = i * freqStep
      const x = (freq / maxFrequency.value) * width
      ctx.fillText(formatFrequency(freq), x, height - 5)
    }
  }
  
  // Y轴标签（幅度）
  if (showYLabels.value) {
    ctx.textAlign = '
- **文件**: webview/components/widgets/FFTPlotWidget.vue
- **行号**: 523
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/FFTPlotWidget.vue 第 537 行发现可疑模式: '
    const magStep = (maxY.value - minY.value) / 10
    for (let i = 0; i <= 10; i++) {
      const magnitude = minY.value + i * magStep
      const y = height - ((magnitude - minY.value) / (maxY.value - minY.value)) * height
      ctx.fillText(formatMagnitude(magnitude), width - 5, y + 4)
    }
  }
}

// 处理新的时域数据
const processTimeData = (newData: number[]) => {
  if (isPaused.value) return
  
  // 添加新数据到缓冲区
  timeData.value.push(...newData)
  
  // 保持缓冲区大小
  if (timeData.value.length > fftSize.value * 2) {
    timeData.value = timeData.value.slice(-fftSize.value * 2)
  }
  
  // 如果有足够的数据，执行FFT
  if (timeData.value.length >= fftSize.value) {
    performFFT(timeData.value)
    drawSpectrum()
    
    // 发送频率检测事件
    emit('
- **文件**: webview/components/widgets/FFTPlotWidget.vue
- **行号**: 537
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/FFTPlotWidget.vue 第 565 行发现可疑模式: ', peakFrequency.value, peakMagnitude.value)
  }
}

// 工具栏事件处理
const toggleAreaDisplay = () => {
  showAreaUnderPlot.value = !showAreaUnderPlot.value
  drawSpectrum()
}

const toggleXLabels = () => {
  showXLabels.value = !showXLabels.value
  drawSpectrum()
}

const toggleYLabels = () => {
  showYLabels.value = !showYLabels.value
  drawSpectrum()
}

const toggleCrosshairs = () => {
  showCrosshairs.value = !showCrosshairs.value
  if (!showCrosshairs.value) {
    mousePosition.value = null
  }
  drawSpectrum()
}

const togglePause = () => {
  isPaused.value = !isPaused.value
}

const resetZoom = () => {
  zoomLevel.value = 1
  panOffset.value = { x: 0, y: 0 }
  isZoomed.value = false
  drawSpectrum()
}

const changeWindowFunction = (newFunction: string) => {
  windowFunction.value = newFunction as any
  // 重新计算当前数据的FFT
  if (timeData.value.length >= fftSize.value) {
    performFFT(timeData.value)
    drawSpectrum()
  }
}

// 鼠标事件处理
const handleMouseDown = (event: MouseEvent) => {
  isDragging.value = true
  dragStart.value = { x: event.offsetX, y: event.offsetY }
}

const handleMouseMove = (event: MouseEvent) => {
  if (!chartCanvas.value) return
  
  const rect = chartCanvas.value.getBoundingClientRect()
  const x = event.offsetX
  const y = event.offsetY
  
  // 更新鼠标位置信息
  if (showCrosshairs.value) {
    const freq = (x / chartCanvas.value.width) * maxFrequency.value
    const mag = minY.value + (1 - y / chartCanvas.value.height) * (maxY.value - minY.value)
    
    mousePosition.value = { freq, mag }
    drawSpectrum()
  }
  
  // 处理拖拽
  if (isDragging.value) {
    const deltaX = x - dragStart.value.x
    const deltaY = y - dragStart.value.y
    
    panOffset.value.x += deltaX
    panOffset.value.y += deltaY
    
    dragStart.value = { x, y }
    isZoomed.value = true
    drawSpectrum()
  }
}

const handleMouseUp = () => {
  isDragging.value = false
}

const handleWheel = (event: WheelEvent) => {
  event.preventDefault()
  
  const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1
  zoomLevel.value *= zoomFactor
  isZoomed.value = zoomLevel.value !== 1
  
  drawSpectrum()
}

const handleMouseLeave = () => {
  isDragging.value = false
  if (!showCrosshairs.value) {
    mousePosition.value = null
    drawSpectrum()
  }
}

// Widget事件处理
const handleRefresh = () => {
  timeData.value = []
  magnitudeData.value = new Array(fftSize.value / 2).fill(-100)
  peakFrequency.value = 0
  peakMagnitude.value = -100
  drawSpectrum()
  emit('
- **文件**: webview/components/widgets/FFTPlotWidget.vue
- **行号**: 565
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的Command Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/FFTPlotWidget.vue 第 328 行发现可疑模式: Function(
- **文件**: webview/components/widgets/FFTPlotWidget.vue
- **行号**: 328
- **CWE ID**: CWE-78
- **建议**: 避免执行外部命令，使用安全的API替代

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GPSWidget.vue 第 251 行发现可疑模式: ${responseTime.value.toFixed(1)}
- **文件**: webview/components/widgets/GPSWidget.vue
- **行号**: 251
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GPSWidget.vue 第 310 行发现可疑模式: ${formatCoordinate(currentPosition.value.lat)}
- **文件**: webview/components/widgets/GPSWidget.vue
- **行号**: 310
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GPSWidget.vue 第 311 行发现可疑模式: ${formatCoordinate(currentPosition.value.lng)}
- **文件**: webview/components/widgets/GPSWidget.vue
- **行号**: 311
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GPSWidget.vue 第 312 行发现可疑模式: ${formatAltitude(currentPosition.value.alt)}
- **文件**: webview/components/widgets/GPSWidget.vue
- **行号**: 312
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GPSWidget.vue 第 358 行发现可疑模式: ${formatCoordinate(newPosition.lat)}
- **文件**: webview/components/widgets/GPSWidget.vue
- **行号**: 358
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GPSWidget.vue 第 359 行发现可疑模式: ${formatCoordinate(newPosition.lng)}
- **文件**: webview/components/widgets/GPSWidget.vue
- **行号**: 359
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GPSWidget.vue 第 360 行发现可疑模式: ${formatAltitude(newPosition.alt)}
- **文件**: webview/components/widgets/GPSWidget.vue
- **行号**: 360
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GPSWidget.vue 第 481 行发现可疑模式: ${alt.toFixed(1)}
- **文件**: webview/components/widgets/GPSWidget.vue
- **行号**: 481
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GPSWidget.vue 第 486 行发现可疑模式: ${accuracy.toFixed(1)}
- **文件**: webview/components/widgets/GPSWidget.vue
- **行号**: 486
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GPSWidget.vue 第 85 行发现可疑模式: "{ height: mapHeight + '
- **文件**: webview/components/widgets/GPSWidget.vue
- **行号**: 85
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GPSWidget.vue 第 356 行发现可疑模式: ">
        <h4>GPS位置</h4>
        <p><strong>纬度:</strong> ${formatCoordinate(newPosition.lat)}°</p>
        <p><strong>经度:</strong> ${formatCoordinate(newPosition.lng)}°</p>
        <p><strong>高度:</strong> ${formatAltitude(newPosition.alt)}</p>
      </div>
    `)

    // 自动居中
    if (autoCenter.value) {
      map.value.setView([newPosition.lat, newPosition.lng], zoomLevel.value)
    }

    // 添加到轨迹
    if (plotTrajectory.value) {
      const trajectoryPoint: GPSTrajectoryPoint = {
        ...newPosition,
        timestamp: Date.now()
      }
      trajectoryPoints.value.push(trajectoryPoint)

      // 限制轨迹点数量（保留最近1000个点）
      if (trajectoryPoints.value.length > 1000) {
        trajectoryPoints.value = trajectoryPoints.value.slice(-1000)
      }

      // 更新轨迹线
      updateTrajectoryPolyline()
    }
  }

  // 更新性能指标
  const now = Date.now()
  if (lastUpdateTime.value > 0) {
    const interval = now - lastUpdateTime.value
    updateRate.value = 1000 / interval
  }
  lastUpdateTime.value = now
  updateCount.value++

  responseTime.value = performance.now() - startTime

  emit('
- **文件**: webview/components/widgets/GPSWidget.vue
- **行号**: 356
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GaugeWidget.vue 第 112 行发现可疑模式: "pointerEnd.x + 1"
- **文件**: webview/components/widgets/GaugeWidget.vue
- **行号**: 112
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GaugeWidget.vue 第 113 行发现可疑模式: "pointerEnd.y + 1"
- **文件**: webview/components/widgets/GaugeWidget.vue
- **行号**: 113
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GaugeWidget.vue 第 366 行发现可疑模式: ';
});

const pointerColor = computed(() => {
  return valueColor.value;
});

// SVG路径计算
const startAngle = -135; // 起始角度
const endAngle = 135;    // 结束角度
const centerX = 150;
const centerY = 150;
const radius = 100;

const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "
- **文件**: webview/components/widgets/GaugeWidget.vue
- **行号**: 366
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GaugeWidget.vue 第 405 行发现可疑模式: ';
  
  const normalizedValue = (currentValue.value - props.minValue) / range;
  const valueAngle = startAngle + (endAngle - startAngle) * normalizedValue;
  
  if (normalizedValue <= 0) return '
- **文件**: webview/components/widgets/GaugeWidget.vue
- **行号**: 405
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GaugeWidget.vue 第 416 行发现可疑模式: ';
  
  const range = props.maxValue - props.minValue;
  const normalizedDanger = (props.dangerValue - props.minValue) / range;
  const dangerAngle = startAngle + (endAngle - startAngle) * normalizedDanger;
  
  return describeArc(centerX, centerY, radius, dangerAngle, endAngle);
});

// 指针位置计算
const pointerEnd = computed(() => {
  const range = props.maxValue - props.minValue;
  if (range === 0) return { x: centerX, y: centerY - radius + 20 };
  
  const normalizedValue = (currentValue.value - props.minValue) / range;
  const angle = startAngle + (endAngle - startAngle) * normalizedValue;
  
  return polarToCartesian(centerX, centerY, radius - 20, angle);
});

// 刻度标记计算
const tickMarks = computed(() => {
  const ticks = [];
  const angleRange = endAngle - startAngle;
  
  for (let i = 0; i <= props.tickCount; i++) {
    const angle = startAngle + (angleRange * i / props.tickCount);
    const isMajor = i % Math.ceil(props.tickCount / 5) === 0;
    const tickRadius = isMajor ? 15 : 8;
    
    const outer = polarToCartesian(centerX, centerY, radius, angle);
    const inner = polarToCartesian(centerX, centerY, radius - tickRadius, angle);
    
    ticks.push({
      angle,
      x1: outer.x,
      y1: outer.y,
      x2: inner.x,
      y2: inner.y,
      major: isMajor
    });
  }
  
  return ticks;
});

// 刻度标签计算
const tickLabels = computed(() => {
  const labels = [];
  const angleRange = endAngle - startAngle;
  const valueRange = props.maxValue - props.minValue;
  
  for (let i = 0; i <= props.tickCount; i++) {
    const angle = startAngle + (angleRange * i / props.tickCount);
    const value = props.minValue + (valueRange * i / props.tickCount);
    
    const position = polarToCartesian(centerX, centerY, radius - 30, angle);
    
    labels.push({
      angle,
      value,
      x: position.x,
      y: position.y,
      text: value.toFixed(0)
    });
  }
  
  return labels;
});

// 方法
const updateValue = (newValue: number) => {
  // 限制值在有效范围内
  const clampedValue = Math.max(props.minValue, Math.min(props.maxValue, newValue));
  
  if (clampedValue !== targetValue.value) {
    targetValue.value = clampedValue;
    animateToValue();
    
    // 更新峰值
    if (clampedValue > peakMax.value) {
      peakMax.value = clampedValue;
    }
    if (clampedValue < peakMin.value) {
      peakMin.value = clampedValue;
    }
    
    // 检查阈值
    if (clampedValue >= props.dangerValue) {
      emit('
- **文件**: webview/components/widgets/GaugeWidget.vue
- **行号**: 416
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GaugeWidget.vue 第 510 行发现可疑模式: ', clampedValue);
    lastUpdate.value = Date.now();
  }
};

const animateToValue = () => {
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value);
  }
  
  const startValue = currentValue.value;
  const endValue = targetValue.value;
  const startTime = Date.now();
  
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / props.animationDuration, 1);
    
    // 使用缓动函数
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    
    currentValue.value = startValue + (endValue - startValue) * easeProgress;
    
    if (progress < 1) {
      animationFrame.value = requestAnimationFrame(animate);
    } else {
      currentValue.value = endValue;
    }
  };
  
  animate();
};

const resetPeakValues = () => {
  peakMin.value = currentValue.value;
  peakMax.value = currentValue.value;
};

const toggleLabels = () => {
  showLabels.value = !showLabels.value;
};

const handleRefresh = () => {
  resetPeakValues();
  updateValue(0);
};

const handleSettings = () => {
  console.log('
- **文件**: webview/components/widgets/GaugeWidget.vue
- **行号**: 510
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GaugeWidget.vue 第 562 行发现可疑模式: ');
};

const handleResize = () => {
  // 响应式调整已通过CSS和computed属性处理
};

const handleSettingsChanged = (config: WidgetConfig) => {
  Object.assign(props.config, config);
};

// 模拟数据更新（演示用）
const simulateDataUpdate = () => {
  setInterval(() => {
    if (hasData.value) {
      // 生成模拟数据
      const time = Date.now() / 1000;
      const value = props.minValue + 
                   (props.maxValue - props.minValue) * 
                   (0.5 + 0.3 * Math.sin(time * 0.5) + 0.2 * Math.random());
      
      updateValue(value);
    }
  }, 1000);
};

// 生命周期
onMounted(async () => {
  await nextTick();
  
  // 初始化峰值
  peakMin.value = props.minValue;
  peakMax.value = props.minValue;
  
  // 开始数据模拟（演示用）
  simulateDataUpdate();
});

onUnmounted(() => {
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value);
  }
});

// 监听器
watch(() => props.datasets, (newDatasets) => {
  if (newDatasets.length > 0) {
    const value = parseFloat(String(newDatasets[0].value)) || 0;
    updateValue(value);
  }
}, { deep: true });

// 暴露组件方法
defineExpose({
  updateValue,
  resetPeakValues,
  getCurrentValue: () => currentValue.value,
  getPeakValues: () => ({ min: peakMin.value, max: peakMax.value })
});
</script>

<style scoped>
.gauge-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 16px;
  min-height: 250px;
}

.gauge-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gauge-svg {
  max-width: 100%;
  max-height: 100%;
}

.value-arc {
  transition: stroke 0.3s ease;
}

.value-arc.danger {
  stroke: #f56c6c !important;
}

.value-arc.warning {
  stroke: #e6a23c !important;
}

.tick-label {
  font-size: 12px;
  font-weight: 500;
}

.gauge-pointer {
  transition: all 0.3s ease;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.gauge-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}

.current-value {
  font-size: 28px;
  font-weight: 600;
  line-height: 1;
  margin-bottom: 4px;
  transition: color 0.3s ease;
}

.current-value.normal {
  color: #67c23a;
}

.current-value.warning {
  color: #e6a23c;
}

.current-value.danger {
  color: #f56c6c;
}

.value-unit {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 2px;
}

.value-percentage {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.peak-values {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  font-size: 12px;
}

.peak-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.peak-label {
  color: var(--el-text-color-secondary);
}

.peak-value {
  font-weight: 500;
}

.peak-value.max {
  color: #f56c6c;
}

.peak-value.min {
  color: #409eff;
}

.status-leds {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.status-led {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  opacity: 0.3;
  transition: opacity 0.3s ease;
}

.status-led.active {
  opacity: 1;
}

.led-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 2px solid currentColor;
  transition: all 0.3s ease;
}

.status-led.active .led-dot {
  box-shadow: 0 0 8px currentColor;
}

.normal-led {
  color: #67c23a;
}

.warning-led {
  color: #e6a23c;
}

.danger-led {
  color: #f56c6c;
}

.led-label {
  font-size: 10px;
  color: var(--el-text-color-secondary);
}

.gauge-stats {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-family: '
- **文件**: webview/components/widgets/GaugeWidget.vue
- **行号**: 562
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GyroscopeWidget.vue 第 80 行发现可疑模式: ${attitudeSize}
- **文件**: webview/components/widgets/GyroscopeWidget.vue
- **行号**: 80
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GyroscopeWidget.vue 第 80 行发现可疑模式: ${attitudeSize}
- **文件**: webview/components/widgets/GyroscopeWidget.vue
- **行号**: 80
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GyroscopeWidget.vue 第 103 行发现可疑模式: ${attitudeCenter}
- **文件**: webview/components/widgets/GyroscopeWidget.vue
- **行号**: 103
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GyroscopeWidget.vue 第 103 行发现可疑模式: ${attitudeCenter}
- **文件**: webview/components/widgets/GyroscopeWidget.vue
- **行号**: 103
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GyroscopeWidget.vue 第 103 行发现可疑模式: ${-attitudes.roll}
- **文件**: webview/components/widgets/GyroscopeWidget.vue
- **行号**: 103
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GyroscopeWidget.vue 第 153 行发现可疑模式: ${attitudeCenter}
- **文件**: webview/components/widgets/GyroscopeWidget.vue
- **行号**: 153
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GyroscopeWidget.vue 第 153 行发现可疑模式: ${attitudeCenter}
- **文件**: webview/components/widgets/GyroscopeWidget.vue
- **行号**: 153
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GyroscopeWidget.vue 第 109 行发现可疑模式: "attitudeRadius + attitudes.pitch * 2"
- **文件**: webview/components/widgets/GyroscopeWidget.vue
- **行号**: 109
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GyroscopeWidget.vue 第 118 行发现可疑模式: "attitudeRadius + attitudes.pitch * 2"
- **文件**: webview/components/widgets/GyroscopeWidget.vue
- **行号**: 118
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GyroscopeWidget.vue 第 137 行发现可疑模式: "attitudeCenter + pitch.offset"
- **文件**: webview/components/widgets/GyroscopeWidget.vue
- **行号**: 137
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GyroscopeWidget.vue 第 138 行发现可疑模式: "attitudeCenter + pitch.length"
- **文件**: webview/components/widgets/GyroscopeWidget.vue
- **行号**: 138
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GyroscopeWidget.vue 第 139 行发现可疑模式: "attitudeCenter + pitch.offset"
- **文件**: webview/components/widgets/GyroscopeWidget.vue
- **行号**: 139
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GyroscopeWidget.vue 第 145 行发现可疑模式: "attitudeCenter + pitch.length + 5"
- **文件**: webview/components/widgets/GyroscopeWidget.vue
- **行号**: 145
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GyroscopeWidget.vue 第 146 行发现可疑模式: "attitudeCenter + pitch.offset + 3"
- **文件**: webview/components/widgets/GyroscopeWidget.vue
- **行号**: 146
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GyroscopeWidget.vue 第 393 行发现可疑模式: ');
});

const hasData = computed(() => {
  return gyroscopeData.value.roll !== undefined || 
         gyroscopeData.value.pitch !== undefined || 
         gyroscopeData.value.yaw !== undefined;
});

const attitudeSize = computed(() => {
  return Math.min(props.size, 200);
});

const attitudeCenter = computed(() => {
  return attitudeSize.value / 2;
});

const attitudeRadius = computed(() => {
  return attitudeSize.value / 2 - 30;
});

const updateRate = computed(() => {
  if (lastFrameTime.value === 0) return 0;
  const now = Date.now();
  const timeDiff = now - lastFrameTime.value;
  return timeDiff > 0 ? Math.round(1000 / timeDiff) : 0;
});

// 俯仰角刻度线
const pitchMarks = computed(() => {
  const marks = [];
  for (let angle = -60; angle <= 60; angle += 10) {
    const offset = angle * 2; // 像素偏移
    const isMajor = angle % 20 === 0;
    
    marks.push({
      angle,
      offset,
      major: isMajor,
      length: isMajor ? 20 : 10
    });
  }
  return marks;
});

// 角速度进度条计算
const rollProgressOffset = computed(() => {
  const progress = Math.abs(gyroscopeData.value.roll) / props.maxAngularRate;
  const circumference = 2 * Math.PI * 35; // 半径35的圆周长
  return circumference * (1 - Math.min(progress, 1));
});

const pitchProgressOffset = computed(() => {
  const progress = Math.abs(gyroscopeData.value.pitch) / props.maxAngularRate;
  const circumference = 2 * Math.PI * 35;
  return circumference * (1 - Math.min(progress, 1));
});

const yawProgressOffset = computed(() => {
  const progress = Math.abs(gyroscopeData.value.yaw) / props.maxAngularRate;
  const circumference = 2 * Math.PI * 35;
  return circumference * (1 - Math.min(progress, 1));
});

// 方法
const initializeGyroscope = async () => {
  try {
    isLoading.value = true;
    
    // 初始化陀螺仪数据
    gyroscopeData.value = { roll: 0, pitch: 0, yaw: 0 };
    attitudes.value = { roll: 0, pitch: 0, yaw: 0 };
    calibrationOffset.value = { roll: 0, pitch: 0, yaw: 0 };
    
    lastUpdateTime.value = Date.now();
    
    isLoading.value = false;
    console.log('
- **文件**: webview/components/widgets/GyroscopeWidget.vue
- **行号**: 393
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GyroscopeWidget.vue 第 475 行发现可疑模式: ';
    isLoading.value = false;
  }
};

const updateAngularRates = (roll: number, pitch: number, yaw: number) => {
  if (isPaused.value) return;
  
  // 应用校准偏移
  const calibratedRoll = roll - calibrationOffset.value.roll;
  const calibratedPitch = pitch - calibrationOffset.value.pitch;
  const calibratedYaw = yaw - calibrationOffset.value.yaw;
  
  gyroscopeData.value.roll = calibratedRoll;
  gyroscopeData.value.pitch = calibratedPitch;
  gyroscopeData.value.yaw = calibratedYaw;
  
  // 积分计算姿态角度
  if (props.enableIntegration) {
    integrateAttitudes(calibratedRoll, calibratedPitch, calibratedYaw);
  }
  
  lastUpdate.value = Date.now();
  recordFrame();
};

const integrateAttitudes = (rollRate: number, pitchRate: number, yawRate: number) => {
  const now = Date.now();
  const dt = (now - lastUpdateTime.value) / 1000; // 转换为秒
  
  if (dt > 0 && dt < 0.1) { // 防止异常大的时间间隔
    // 简单的欧拉积分
    attitudes.value.roll += rollRate * dt;
    attitudes.value.pitch += pitchRate * dt;
    attitudes.value.yaw += yawRate * dt;
    
    // 限制角度范围
    attitudes.value.roll = normalizeAngle(attitudes.value.roll);
    attitudes.value.pitch = Math.max(-90, Math.min(90, attitudes.value.pitch));
    attitudes.value.yaw = normalizeAngle(attitudes.value.yaw);
  }
  
  lastUpdateTime.value = now;
};

const normalizeAngle = (angle: number): number => {
  while (angle > 180) angle -= 360;
  while (angle < -180) angle += 360;
  return angle;
};

const recordFrame = () => {
  frameCount.value++;
  const now = Date.now();
  
  if (lastFrameTime.value > 0) {
    const timeDiff = now - lastFrameTime.value;
    if (timeDiff > 0) {
      performanceStore.recordFrame();
    }
  }
  
  lastFrameTime.value = now;
};

const togglePause = () => {
  isPaused.value = !isPaused.value;
};

const resetGyroscope = () => {
  gyroscopeData.value = { roll: 0, pitch: 0, yaw: 0 };
  attitudes.value = { roll: 0, pitch: 0, yaw: 0 };
  lastUpdateTime.value = Date.now();
};

const toggleCalibration = () => {
  if (isCalibrating.value) {
    stopCalibration();
  } else {
    startCalibration();
  }
};

const startCalibration = () => {
  isCalibrating.value = true;
  calibrationProgress.value = 0;
  
  const calibrationSamples: Array<{ roll: number; pitch: number; yaw: number }> = [];
  const sampleDuration = 3000; // 3秒校准
  const sampleInterval = 50; // 50ms采样间隔
  const totalSamples = sampleDuration / sampleInterval;
  
  const calibrationTimer = setInterval(() => {
    calibrationSamples.push({
      roll: gyroscopeData.value.roll,
      pitch: gyroscopeData.value.pitch,
      yaw: gyroscopeData.value.yaw
    });
    
    calibrationProgress.value = (calibrationSamples.length / totalSamples) * 100;
    
    if (calibrationSamples.length >= totalSamples) {
      // 计算平均偏移
      const avgRoll = calibrationSamples.reduce((sum, sample) => sum + sample.roll, 0) / calibrationSamples.length;
      const avgPitch = calibrationSamples.reduce((sum, sample) => sum + sample.pitch, 0) / calibrationSamples.length;
      const avgYaw = calibrationSamples.reduce((sum, sample) => sum + sample.yaw, 0) / calibrationSamples.length;
      
      calibrationOffset.value = {
        roll: avgRoll,
        pitch: avgPitch,
        yaw: avgYaw
      };
      
      clearInterval(calibrationTimer);
      stopCalibration();
      
      console.log('
- **文件**: webview/components/widgets/GyroscopeWidget.vue
- **行号**: 475
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GyroscopeWidget.vue 第 614 行发现可疑模式: ');
};

const handleResize = (size: { width: number; height: number }) => {
  // 陀螺仪会根据容器大小自动调整
};

const handleSettingsChanged = (config: WidgetConfig) => {
  Object.assign(props.config, config);
  initializeGyroscope();
};

// 模拟数据更新（用于演示）
const simulateDataUpdate = () => {
  let time = 0;
  
  setInterval(() => {
    if (!isPaused.value && props.realtime) {
      time += 0.02;
      
      // 模拟陀螺仪数据
      const roll = Math.sin(time) * 50 + (Math.random() - 0.5) * 10;
      const pitch = Math.cos(time * 0.7) * 30 + (Math.random() - 0.5) * 8;
      const yaw = Math.sin(time * 0.3) * 80 + (Math.random() - 0.5) * 15;
      
      updateAngularRates(roll, pitch, yaw);
    }
  }, props.updateInterval);
};

// 生命周期
onMounted(async () => {
  await nextTick();
  await initializeGyroscope();
  
  // 开始模拟数据更新（演示用）
  if (props.realtime) {
    simulateDataUpdate();
  }
});

onUnmounted(() => {
  if (isCalibrating.value) {
    stopCalibration();
  }
});

// 监听器
watch(() => props.datasets, () => {
  initializeGyroscope();
}, { deep: true });

// 暴露组件方法
defineExpose({
  updateAngularRates,
  resetGyroscope,
  togglePause,
  startCalibration,
  getAngularRates: () => gyroscopeData.value,
  getAttitudes: () => attitudes.value
});
</script>

<style scoped>
.gyroscope-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.gyroscope-attitude {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.attitude-display {
  display: flex;
  align-items: center;
  justify-content: center;
}

.attitude-svg {
  max-width: 100%;
  max-height: 100%;
  overflow: hidden;
  border-radius: 50%;
}

.attitude-outer-ring {
  fill: none;
  stroke: var(--el-border-color);
  stroke-width: 3;
}

.horizon-line {
  stroke: #fff;
  stroke-width: 3;
}

.pitch-mark {
  stroke: var(--el-text-color-secondary);
  stroke-width: 1;
}

.pitch-mark.major {
  stroke: var(--el-text-color-primary);
  stroke-width: 2;
}

.pitch-label {
  fill: var(--el-text-color-primary);
  font-size: 10px;
  font-weight: 500;
}

.aircraft-wing {
  stroke: var(--el-color-warning);
  stroke-width: 3;
}

.aircraft-body {
  stroke: var(--el-color-warning);
  stroke-width: 2;
}

.aircraft-center {
  fill: var(--el-color-warning);
}

.yaw-circle {
  fill: var(--el-bg-color);
  stroke: var(--el-border-color);
  stroke-width: 2;
}

.yaw-text {
  fill: var(--el-text-color-primary);
  font-size: 10px;
  font-weight: bold;
}

.gyroscope-rates {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rates-display {
  width: 100%;
  max-width: 300px;
}

.rate-indicators {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 16px;
}

.rate-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.rate-circle {
  position: relative;
}

.rate-background {
  fill: none;
  stroke: var(--el-border-color-lighter);
  stroke-width: 4;
}

.rate-progress {
  fill: none;
  stroke-width: 4;
  stroke-linecap: round;
  transform-origin: center;
  transform: rotate(-90deg);
  stroke-dasharray: 219.8; /* 2 * PI * 35 */
  transition: stroke-dashoffset 0.2s ease;
}

.roll-progress {
  stroke: #f56c6c;
}

.pitch-progress {
  stroke: #67c23a;
}

.yaw-progress {
  stroke: #409eff;
}

.rate-label {
  fill: var(--el-text-color-secondary);
  font-size: 9px;
  font-weight: 500;
}

.rate-value {
  fill: var(--el-text-color-primary);
  font-size: 11px;
  font-weight: bold;
  font-family: '
- **文件**: webview/components/widgets/GyroscopeWidget.vue
- **行号**: 614
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/LEDWidget.vue 第 92 行发现可疑模式: ${layoutMode}
- **文件**: webview/components/widgets/LEDWidget.vue
- **行号**: 92
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/LEDWidget.vue 第 93 行发现可疑模式: ${ledSize}
- **文件**: webview/components/widgets/LEDWidget.vue
- **行号**: 93
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/LEDWidget.vue 第 99 行发现可疑模式: ${index}
- **文件**: webview/components/widgets/LEDWidget.vue
- **行号**: 99
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/LEDWidget.vue 第 115 行发现可疑模式: ${getLEDGlowSize()}
- **文件**: webview/components/widgets/LEDWidget.vue
- **行号**: 115
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/LEDWidget.vue 第 115 行发现可疑模式: ${led.color}
- **文件**: webview/components/widgets/LEDWidget.vue
- **行号**: 115
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/LEDWidget.vue 第 131 行发现可疑模式: ${index + 1}
- **文件**: webview/components/widgets/LEDWidget.vue
- **行号**: 131
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/LEDWidget.vue 第 312 行发现可疑模式: ${x}
- **文件**: webview/components/widgets/LEDWidget.vue
- **行号**: 312
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/LEDWidget.vue 第 313 行发现可疑模式: ${y}
- **文件**: webview/components/widgets/LEDWidget.vue
- **行号**: 313
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/LEDWidget.vue 第 373 行发现可疑模式: ${i + 1}
- **文件**: webview/components/widgets/LEDWidget.vue
- **行号**: 373
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/LEDWidget.vue 第 130 行发现可疑模式: ">
            {{ led.label || `LED ${index + 1}` }}
          </div>
          
          <!-- LED值显示 -->
          <div class="
- **文件**: webview/components/widgets/LEDWidget.vue
- **行号**: 130
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/LEDWidget.vue 第 302 行发现可疑模式: ') {
    const angle = (360 / totalLEDs.value) * index;
    const radius = 80;
    const centerX = 50;
    const centerY = 50;
    const x = centerX + radius * Math.cos((angle - 90) * Math.PI / 180);
    const y = centerY + radius * Math.sin((angle - 90) * Math.PI / 180);
    
    return {
      position: '
- **文件**: webview/components/widgets/LEDWidget.vue
- **行号**: 302
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/LEDWidget.vue 第 357 行发现可疑模式: '  // 靛蓝色
];

// 方法
const initializeLEDs = async () => {
  try {
    isLoading.value = true;
    
    // 初始化LED状态数组
    const initialStates: LEDState[] = [];
    
    for (let i = 0; i < props.ledCount; i++) {
      const dataset = props.datasets[i];
      initialStates.push({
        state: false,
        color: dataset?.color || defaultColors[i % defaultColors.length],
        label: dataset?.title || `LED ${i + 1}`,
        value: dataset?.value ? Number(dataset.value) : undefined,
        icon: getRandomIcon(),
        blinking: false,
        brightness: 1.0
      });
    }
    
    ledStates.value = initialStates;
    ledData.value.states = initialStates;
    
    isLoading.value = false;
    console.log('
- **文件**: webview/components/widgets/LEDWidget.vue
- **行号**: 357
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/LEDWidget.vue 第 390 行发现可疑模式: ';
    isLoading.value = false;
  }
};

const getRandomIcon = () => {
  const icons = [undefined, CircleCheck, Warning, InfoFilled, SuccessFilled];
  return icons[Math.floor(Math.random() * icons.length)];
};

const updateLEDState = (index: number, state: boolean, value?: number, blinking?: boolean) => {
  if (isPaused.value || index >= ledStates.value.length) return;
  
  ledStates.value[index].state = state;
  if (value !== undefined) {
    ledStates.value[index].value = value;
  }
  if (blinking !== undefined) {
    ledStates.value[index].blinking = blinking;
  }
  
  // 更新数据对象
  ledData.value.states = [...ledStates.value];
  
  lastUpdate.value = Date.now();
  recordFrame();
};

const updateAllLEDs = (states: boolean[]) => {
  if (isPaused.value) return;
  
  states.forEach((state, index) => {
    if (index < ledStates.value.length) {
      ledStates.value[index].state = state;
    }
  });
  
  ledData.value.states = [...ledStates.value];
  
  lastUpdate.value = Date.now();
  recordFrame();
};

const toggleLED = (index: number) => {
  if (index >= ledStates.value.length) return;
  
  ledStates.value[index].state = !ledStates.value[index].state;
  ledData.value.states = [...ledStates.value];
  
  lastUpdate.value = Date.now();
  recordFrame();
};

const recordFrame = () => {
  frameCount.value++;
  const now = Date.now();
  
  if (lastFrameTime.value > 0) {
    const timeDiff = now - lastFrameTime.value;
    if (timeDiff > 0) {
      performanceStore.recordFrame();
    }
  }
  
  lastFrameTime.value = now;
};

const togglePause = () => {
  isPaused.value = !isPaused.value;
};

const handleLayoutChange = (command: string) => {
  layoutMode.value = command as '
- **文件**: webview/components/widgets/LEDWidget.vue
- **行号**: 390
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/MultiPlotWidget.vue 第 380 行发现可疑模式: ${curves.value.length + 1}
- **文件**: webview/components/widgets/MultiPlotWidget.vue
- **行号**: 380
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/MultiPlotWidget.vue 第 418 行发现可疑模式: ${curve.color}
- **文件**: webview/components/widgets/MultiPlotWidget.vue
- **行号**: 418
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/MultiPlotWidget.vue 第 577 行发现可疑模式: ${(value / 1000).toFixed(1)}
- **文件**: webview/components/widgets/MultiPlotWidget.vue
- **行号**: 577
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/MultiPlotWidget.vue 第 287 行发现可疑模式: ')
const totalCurves = computed(() => curves.value.length)
const visibleCurveCount = computed(() => curves.value.filter(c => c.visible).length)
const dataPointsCount = computed(() => 
  curves.value.reduce((sum, curve) => sum + curve.data.length, 0)
)
const allCurvesVisible = computed(() => 
  curves.value.length > 0 && curves.value.every(c => c.visible)
)
const chartAreaWidth = computed(() => 
  showLegends.value ? '
- **文件**: webview/components/widgets/MultiPlotWidget.vue
- **行号**: 287
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/MultiPlotWidget.vue 第 353 行发现可疑模式: ')
}

// 创建新曲线
const createCurve = (id: string, label: string): CurveData => {
  const colorIndex = curves.value.length % colorPalette.length
  
  return {
    id,
    label,
    color: colorPalette[colorIndex],
    visible: true,
    data: [],
    lastValue: 0,
    minValue: 0,
    maxValue: 0
  }
}

// 添加数据点到曲线
const addDataPoint = (curveId: string, value: number) => {
  if (isPaused.value) return

  let curve = curves.value.find(c => c.id === curveId)
  
  // 如果曲线不存在，创建新曲线
  if (!curve) {
    curve = createCurve(curveId, `数据序列 ${curves.value.length + 1}`)
    curves.value.push(curve)
    updateChartDatasets()
  }

  // 添加数据点
  const dataPoint = {
    x: sampleCounter.value,
    y: value
  }
  
  curve.data.push(dataPoint)
  
  // 限制数据点数量
  if (curve.data.length > props.maxDataPoints) {
    curve.data = curve.data.slice(-props.maxDataPoints)
  }

  // 更新统计信息
  curve.lastValue = value
  curve.minValue = Math.min(curve.minValue, value)
  curve.maxValue = Math.max(curve.maxValue, value)

  sampleCounter.value++
  
  // 更新图表
  updateChart()
}

// 更新Chart.js数据集
const updateChartDatasets = () => {
  if (!chart.value) return

  chart.value.data.datasets = curves.value.map(curve => ({
    label: curve.label,
    data: curve.data,
    borderColor: curve.color,
    backgroundColor: interpolateMode.value ? 
      `${curve.color}20` : curve.color,
    borderWidth: 2,
    pointRadius: interpolateMode.value ? 0 : 2,
    pointHoverRadius: 4,
    fill: false,
    tension: interpolateMode.value ? 0.1 : 0,
    hidden: !curve.visible
  }))
}

// 更新图表
const updateChart = () => {
  if (!chart.value) return

  updateChartDatasets()
  chart.value.update('
- **文件**: webview/components/widgets/MultiPlotWidget.vue
- **行号**: 353
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/Plot3DWidget.vue 第 697 行发现可疑模式: ${range.min.toFixed(2)}
- **文件**: webview/components/widgets/Plot3DWidget.vue
- **行号**: 697
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/Plot3DWidget.vue 第 697 行发现可疑模式: ${range.max.toFixed(2)}
- **文件**: webview/components/widgets/Plot3DWidget.vue
- **行号**: 697
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/Plot3DWidget.vue 第 701 行发现可疑模式: ${angles.x.toFixed(1)}
- **文件**: webview/components/widgets/Plot3DWidget.vue
- **行号**: 701
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/Plot3DWidget.vue 第 701 行发现可疑模式: ${angles.y.toFixed(1)}
- **文件**: webview/components/widgets/Plot3DWidget.vue
- **行号**: 701
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/Plot3DWidget.vue 第 701 行发现可疑模式: ${angles.z.toFixed(1)}
- **文件**: webview/components/widgets/Plot3DWidget.vue
- **行号**: 701
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/Plot3DWidget.vue 第 705 行发现可疑模式: ${offset.x.toFixed(2)}
- **文件**: webview/components/widgets/Plot3DWidget.vue
- **行号**: 705
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/Plot3DWidget.vue 第 705 行发现可疑模式: ${offset.y.toFixed(2)}
- **文件**: webview/components/widgets/Plot3DWidget.vue
- **行号**: 705
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/Plot3DWidget.vue 第 705 行发现可疑模式: ${offset.z.toFixed(2)}
- **文件**: webview/components/widgets/Plot3DWidget.vue
- **行号**: 705
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/Plot3DWidget.vue 第 113 行发现可疑模式: "{ height: canvasHeight + '
- **文件**: webview/components/widgets/Plot3DWidget.vue
- **行号**: 113
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/Plot3DWidget.vue 第 384 行发现可疑模式: ', new THREE.BufferAttribute(vertices, 3))
  
  const material = new THREE.LineBasicMaterial({ color: 0xffffff })
  const indicator = new THREE.Line(geometry, material)
  
  cameraIndicator.value.add(indicator)
  scene.value.add(cameraIndicator.value)
}

// 设置相机控制
const setupCameraControls = () => {
  // 简化的相机控制实现
  // 实际项目中建议使用Three.js的OrbitControls
}

// 开始渲染循环
const startRenderLoop = () => {
  const animate = (time: number) => {
    animationId.value = requestAnimationFrame(animate)
    
    // 计算FPS
    if (time - lastFrameTime.value >= 1000) {
      currentFPS.value = frameCount.value
      frameCount.value = 0
      lastFrameTime.value = time
    }
    frameCount.value++
    
    // 渲染场景
    render()
  }
  
  animate(0)
}

// 渲染场景
const render = () => {
  if (!renderer.value || !scene.value || !camera.value) return

  if (anaglyphEnabled.value) {
    renderAnaglyph()
  } else {
    renderer.value.render(scene.value, camera.value)
  }
}

// 渲染立体（红青）模式
const renderAnaglyph = () => {
  if (!renderer.value || !scene.value || !camera.value) return

  // 保存原始相机位置
  const originalPosition = camera.value.position.clone()
  
  // 计算眼距
  const eyeDistance = eyeSeparation.value / 1000
  const halfDistance = eyeDistance / 2
  
  // 设置左右眼位置
  const leftEyePos = originalPosition.clone()
  const rightEyePos = originalPosition.clone()
  
  if (invertEyePositions.value) {
    leftEyePos.x += halfDistance
    rightEyePos.x -= halfDistance
  } else {
    leftEyePos.x -= halfDistance
    rightEyePos.x += halfDistance
  }
  
  // 创建渲染目标
  const renderTarget = new THREE.WebGLRenderTarget(
    renderer.value.domElement.width,
    renderer.value.domElement.height
  )
  
  // 渲染左眼（红色通道）
  camera.value.position.copy(leftEyePos)
  renderer.value.setRenderTarget(renderTarget)
  renderer.value.render(scene.value, camera.value)
  
  // 渲染右眼（青色通道）
  camera.value.position.copy(rightEyePos)
  renderer.value.setRenderTarget(null)
  renderer.value.render(scene.value, camera.value)
  
  // 恢复原始位置
  camera.value.position.copy(originalPosition)
}

// 更新3D数据
const updateDataVisualization = () => {
  if (!dataGroup.value || dataPoints.value.length === 0) return

  // 清除现有数据
  dataGroup.value.clear()
  
  // 创建线条几何体
  const geometry = new THREE.BufferGeometry()
  const vertices: number[] = []
  const colors: number[] = []
  
  for (let i = 0; i < dataPoints.value.length; i++) {
    const point = dataPoints.value[i]
    vertices.push(point.x, point.y, point.z)
    
    // 插值颜色
    if (interpolationEnabled.value && dataPoints.value.length > 1) {
      const t = i / (dataPoints.value.length - 1)
      const r = 0.2 + t * 0.8  // 从深红到亮红
      const g = 0.1 + t * 0.4  // 从暗到稍亮
      const b = 0.8 - t * 0.6  // 从亮蓝到暗蓝
      colors.push(r, g, b)
    } else {
      colors.push(0.6, 0.3, 0.9) // 默认紫色
    }
  }
  
  geometry.setAttribute('
- **文件**: webview/components/widgets/Plot3DWidget.vue
- **行号**: 384
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/Plot3DWidget.vue 第 576 行发现可疑模式: ':
      camera.value.position.set(0, 0, distance)
      break
  }
  
  camera.value.lookAt(0, 0, 0)
  
  // 更新相机角度记录
  const spherical = new THREE.Spherical()
  spherical.setFromVector3(camera.value.position)
  cameraAngles.value.set(
    spherical.phi * 180 / Math.PI,
    spherical.theta * 180 / Math.PI,
    0
  )
}

const toggleAnaglyph = () => {
  anaglyphEnabled.value = !anaglyphEnabled.value
}

const toggleInvertEyes = () => {
  invertEyePositions.value = !invertEyePositions.value
}

const updateEyeSeparation = (value: number) => {
  eyeSeparation.value = value
}

// 鼠标事件处理
const handleWheel = (event: WheelEvent) => {
  event.preventDefault()
  
  if (!camera.value) return
  
  const zoomSpeed = 0.1
  const delta = event.deltaY > 0 ? 1 + zoomSpeed : 1 - zoomSpeed
  
  camera.value.position.multiplyScalar(delta)
  worldScale.value *= delta
}

const handleMouseDown = (event: MouseEvent) => {
  isMouseDown.value = true
  lastMousePos.value = { x: event.clientX, y: event.clientY }
}

const handleMouseMove = (event: MouseEvent) => {
  if (!isMouseDown.value || !camera.value) return
  
  const deltaX = event.clientX - lastMousePos.value.x
  const deltaY = event.clientY - lastMousePos.value.y
  
  if (orbitNavigation.value) {
    // 轨道导航模式
    const spherical = new THREE.Spherical()
    spherical.setFromVector3(camera.value.position)
    
    spherical.theta -= deltaX * 0.01
    spherical.phi += deltaY * 0.01
    spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi))
    
    camera.value.position.setFromSpherical(spherical)
    camera.value.lookAt(0, 0, 0)
  } else {
    // 平移导航模式
    const right = new THREE.Vector3()
    const up = new THREE.Vector3()
    
    camera.value.getWorldDirection(right)
    right.cross(camera.value.up).normalize()
    up.copy(camera.value.up)
    
    const moveSpeed = 0.01
    camera.value.position.add(right.multiplyScalar(-deltaX * moveSpeed))
    camera.value.position.add(up.multiplyScalar(deltaY * moveSpeed))
  }
  
  lastMousePos.value = { x: event.clientX, y: event.clientY }
}

const handleMouseUp = () => {
  isMouseDown.value = false
}

const handleMouseLeave = () => {
  isMouseDown.value = false
}

// Widget事件处理
const handleRefresh = () => {
  dataPoints.value = []
  updateDataVisualization()
  emit('
- **文件**: webview/components/widgets/Plot3DWidget.vue
- **行号**: 576
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/PlotWidget.vue 第 227 行发现可疑模式: ${min}
- **文件**: webview/components/widgets/PlotWidget.vue
- **行号**: 227
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/PlotWidget.vue 第 227 行发现可疑模式: ${max}
- **文件**: webview/components/widgets/PlotWidget.vue
- **行号**: 227
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/PlotWidget.vue 第 274 行发现可疑模式: ${datasetLabel}
- **文件**: webview/components/widgets/PlotWidget.vue
- **行号**: 274
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/PlotWidget.vue 第 274 行发现可疑模式: ${value}
- **文件**: webview/components/widgets/PlotWidget.vue
- **行号**: 274
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/PlotWidget.vue 第 274 行发现可疑模式: ${unit}
- **文件**: webview/components/widgets/PlotWidget.vue
- **行号**: 274
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/PlotWidget.vue 第 405 行发现可疑模式: ${index + 1}
- **文件**: webview/components/widgets/PlotWidget.vue
- **行号**: 405
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/PlotWidget.vue 第 202 行发现可疑模式: ');
});

const hasData = computed(() => {
  return chartData.value.some(series => series.length > 0);
});

const totalDataPoints = computed(() => {
  return chartData.value.reduce((total, series) => total + series.length, 0);
});

const updateRate = computed(() => {
  if (lastFrameTime.value === 0) return 0;
  const now = Date.now();
  const timeDiff = now - lastFrameTime.value;
  return timeDiff > 0 ? Math.round(1000 / timeDiff) : 0;
});

const yRangeText = computed(() => {
  if (!chart.value) return '
- **文件**: webview/components/widgets/PlotWidget.vue
- **行号**: 202
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/PlotWidget.vue 第 392 行发现可疑模式: '
  ];
  
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(defaultColors[i % defaultColors.length]);
  }
  
  return result;
};

const generateChartDatasets = () => {
  return chartData.value.map((data, index) => ({
    label: dataLabels.value[index] || `系列 ${index + 1}`,
    data: data,
    borderColor: colors.value[index],
    backgroundColor: props.showFill 
      ? colors.value[index] + '
- **文件**: webview/components/widgets/PlotWidget.vue
- **行号**: 392
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/PlotWidget.vue 第 455 行发现可疑模式: ', error);
  }
};

const recordFrame = () => {
  frameCount.value++;
  const now = Date.now();
  
  if (lastFrameTime.value > 0) {
    const timeDiff = now - lastFrameTime.value;
    if (timeDiff > 0) {
      performanceStore.recordFrame();
    }
  }
  
  lastFrameTime.value = now;
};

const togglePause = () => {
  isPaused.value = !isPaused.value;
};

const autoScale = () => {
  if (!chart.value) return;
  
  chart.value.resetZoom();
};

const clearData = () => {
  chartData.value.forEach(data => data.length = 0);
  updateChart();
};

const handleRefresh = () => {
  initializeChart();
};

const handleSettings = () => {
  // 设置对话框已在BaseWidget中处理
  console.log('
- **文件**: webview/components/widgets/PlotWidget.vue
- **行号**: 455
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/PlotWidget.vue 第 516 行发现可疑模式: ', event);
};

// 模拟数据更新（用于演示）
const simulateDataUpdate = () => {
  if (props.datasets.length === 0) return;

  setInterval(() => {
    if (!isPaused.value && hasData.value) {
      props.datasets.forEach((dataset, index) => {
        const value = Math.sin(Date.now() / 1000 + index) * 50 + 
                     Math.random() * 20 + index * 25;
        
        addDataPoint(index, {
          x: Date.now(),
          y: value,
          timestamp: Date.now()
        });
      });
    }
  }, props.updateInterval);
};

// 生命周期
onMounted(async () => {
  await nextTick();
  await initializeChart();
  
  // 开始模拟数据更新（演示用）
  if (props.realtime) {
    simulateDataUpdate();
  }
});

onUnmounted(() => {
  if (chart.value) {
    chart.value.destroy();
  }
});

// 监听器
watch(() => props.datasets, () => {
  initializeChart();
}, { deep: true });

watch(() => themeStore.currentTheme, () => {
  if (chart.value) {
    chart.value.options = chartOptions.value;
    chart.value.update();
  }
});

// 暴露组件方法
defineExpose({
  addDataPoint,
  clearData,
  autoScale,
  togglePause,
  getChart: () => chart.value
});
</script>

<style scoped>
.plot-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 200px;
}

.plot-canvas {
  width: 100% !important;
  height: 100% !important;
}

.plot-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-secondary);
}

.loading-icon {
  font-size: 24px;
  animation: spin 1s linear infinite;
}

.data-info-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  border-radius: 4px;
  padding: 8px;
  color: white;
  font-size: 12px;
  pointer-events: none;
}

.data-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.info-label {
  opacity: 0.8;
}

.info-value {
  font-weight: 500;
}

.plot-stats {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-family: '
- **文件**: webview/components/widgets/PlotWidget.vue
- **行号**: 516
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的Command Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/PlotWidget.vue 第 311 行发现可疑模式: function(
- **文件**: webview/components/widgets/PlotWidget.vue
- **行号**: 311
- **CWE ID**: CWE-78
- **建议**: 避免执行外部命令，使用安全的API替代

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/TerminalWidget.vue 第 103 行发现可疑模式: ${wrapMode}
- **文件**: webview/components/widgets/TerminalWidget.vue
- **行号**: 103
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/TerminalWidget.vue 第 106 行发现可疑模式: ${fontSize}
- **文件**: webview/components/widgets/TerminalWidget.vue
- **行号**: 106
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/TerminalWidget.vue 第 112 行发现可疑模式: ${index}
- **文件**: webview/components/widgets/TerminalWidget.vue
- **行号**: 112
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/TerminalWidget.vue 第 115 行发现可疑模式: ${line.level}
- **文件**: webview/components/widgets/TerminalWidget.vue
- **行号**: 115
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/TerminalWidget.vue 第 341 行发现可疑模式: ${props.maxLines}
- **文件**: webview/components/widgets/TerminalWidget.vue
- **行号**: 341
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/TerminalWidget.vue 第 342 行发现可疑模式: ${props.updateInterval}
- **文件**: webview/components/widgets/TerminalWidget.vue
- **行号**: 342
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/TerminalWidget.vue 第 390 行发现可疑模式: ${Date.now()}
- **文件**: webview/components/widgets/TerminalWidget.vue
- **行号**: 390
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/TerminalWidget.vue 第 390 行发现可疑模式: ${Math.random().toString(36).substr(2, 9)}
- **文件**: webview/components/widgets/TerminalWidget.vue
- **行号**: 390
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/TerminalWidget.vue 第 466 行发现可疑模式: ${command}
- **文件**: webview/components/widgets/TerminalWidget.vue
- **行号**: 466
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/TerminalWidget.vue 第 490 行发现可疑模式: ${isPaused.value ? '暂停' : '运行中'}
- **文件**: webview/components/widgets/TerminalWidget.vue
- **行号**: 490
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/TerminalWidget.vue 第 491 行发现可疑模式: ${totalLines.value}
- **文件**: webview/components/widgets/TerminalWidget.vue
- **行号**: 491
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/TerminalWidget.vue 第 492 行发现可疑模式: ${updateRate.value}
- **文件**: webview/components/widgets/TerminalWidget.vue
- **行号**: 492
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/TerminalWidget.vue 第 501 行发现可疑模式: ${command}
- **文件**: webview/components/widgets/TerminalWidget.vue
- **行号**: 501
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/TerminalWidget.vue 第 536 行发现可疑模式: ${isPaused.value ? '已暂停' : '已恢复'}
- **文件**: webview/components/widgets/TerminalWidget.vue
- **行号**: 536
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/TerminalWidget.vue 第 541 行发现可疑模式: ${autoScroll.value ? '已开启' : '已关闭'}
- **文件**: webview/components/widgets/TerminalWidget.vue
- **行号**: 541
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/TerminalWidget.vue 第 550 行发现可疑模式: ${command}
- **文件**: webview/components/widgets/TerminalWidget.vue
- **行号**: 550
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/TerminalWidget.vue 第 555 行发现可疑模式: ${command}
- **文件**: webview/components/widgets/TerminalWidget.vue
- **行号**: 555
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/TerminalWidget.vue 第 304 行发现可疑模式: ');
});

const hasData = computed(() => {
  return terminalLines.value.length > 0;
});

const updateRate = computed(() => {
  if (lastFrameTime.value === 0) return 0;
  const now = Date.now();
  const timeDiff = now - lastFrameTime.value;
  return timeDiff > 0 ? Math.round(1000 / timeDiff) : 0;
});

const totalLines = computed(() => terminalLines.value.length);
const filteredLines = computed(() => displayLines.value.length);

const totalBytes = computed(() => {
  return terminalLines.value.reduce((total, line) => total + line.content.length, 0);
});

const displayLines = computed(() => {
  // 这里可以添加过滤逻辑
  return terminalLines.value;
});

// 方法
const initializeTerminal = async () => {
  try {
    isLoading.value = true;
    
    // 初始化终端
    terminalLines.value = [];
    terminalData.value = { lines: [] };
    
    // 添加欢迎信息
    addLine('
- **文件**: webview/components/widgets/TerminalWidget.vue
- **行号**: 304
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/TerminalWidget.vue 第 431 行发现可疑模式: ');
  
  // 高亮数字
  escaped = escaped.replace(/\b\d+(\.\d+)?\b/g, '
- **文件**: webview/components/widgets/TerminalWidget.vue
- **行号**: 431
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/TerminalWidget.vue 第 502 行发现可疑模式: ');
  }
};

const navigateHistory = (direction: number) => {
  if (commandHistory.value.length === 0) return;
  
  historyIndex.value += direction;
  
  if (historyIndex.value < -1) {
    historyIndex.value = commandHistory.value.length - 1;
  } else if (historyIndex.value >= commandHistory.value.length) {
    historyIndex.value = -1;
  }
  
  currentCommand.value = historyIndex.value === -1 ? '
- **文件**: webview/components/widgets/TerminalWidget.vue
- **行号**: 502
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/TerminalWidget.vue 第 517 行发现可疑模式: ' : commandHistory.value[historyIndex.value];
};

const recordFrame = () => {
  frameCount.value++;
  const now = Date.now();
  
  if (lastFrameTime.value > 0) {
    const timeDiff = now - lastFrameTime.value;
    if (timeDiff > 0) {
      performanceStore.recordFrame();
    }
  }
  
  lastFrameTime.value = now;
};

const togglePause = () => {
  isPaused.value = !isPaused.value;
  addLine(`终端${isPaused.value ? '
- **文件**: webview/components/widgets/TerminalWidget.vue
- **行号**: 517
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/i18n/I18nManager.ts 第 49 行发现可疑模式: ${locale}
- **文件**: webview/i18n/I18nManager.ts
- **行号**: 49
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/i18n/I18nManager.ts 第 49 行发现可疑模式: ${key}
- **文件**: webview/i18n/I18nManager.ts
- **行号**: 49
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/i18n/I18nManager.ts 第 164 行发现可疑模式: ${locale}
- **文件**: webview/i18n/I18nManager.ts
- **行号**: 164
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/i18n/I18nManager.ts 第 335 行发现可疑模式: ${this.config.currentLocale}
- **文件**: webview/i18n/I18nManager.ts
- **行号**: 335
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/i18n/I18nManager.ts 第 349 行发现可疑模式: ${locale}
- **文件**: webview/i18n/I18nManager.ts
- **行号**: 349
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/i18n/I18nManager.ts 第 380 行发现可疑模式: ${oldLocale}
- **文件**: webview/i18n/I18nManager.ts
- **行号**: 380
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/i18n/I18nManager.ts 第 380 行发现可疑模式: ${locale}
- **文件**: webview/i18n/I18nManager.ts
- **行号**: 380
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/i18n/I18nManager.ts 第 382 行发现可疑模式: ${locale}
- **文件**: webview/i18n/I18nManager.ts
- **行号**: 382
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/i18n/I18nManager.ts 第 448 行发现可疑模式: ${key}
- **文件**: webview/i18n/I18nManager.ts
- **行号**: 448
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/i18n/I18nManager.ts 第 537 行发现可疑模式: ${locale}
- **文件**: webview/i18n/I18nManager.ts
- **行号**: 537
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/i18n/I18nManager.ts 第 651 行发现可疑模式: ${key}
- **文件**: webview/i18n/I18nManager.ts
- **行号**: 651
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/i18n/I18nManager.ts 第 651 行发现可疑模式: ${locale}
- **文件**: webview/i18n/I18nManager.ts
- **行号**: 651
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/i18n/I18nManager.ts 第 581 行发现可疑模式: ' ? current : null;
  }

  /**
   * 插值处理
   */
  private interpolate(text: string, params: InterpolationParams | (string | number)[]): string {
    if (Array.isArray(params)) {
      // 位置参数插值: Hello {0}, welcome to {1}
      return text.replace(/\{(\d+)\}/g, (match, index) => {
        const paramIndex = parseInt(index, 10);
        return paramIndex < params.length ? String(params[paramIndex]) : match;
      });
    } else {
      // 命名参数插值: Hello {name}, welcome to {app}
      return text.replace(/\{([^}]+)\}/g, (match, key) => {
        return key in params ? String(params[key]) : match;
      });
    }
  }

  /**
   * 应用RTL设置
   */
  private applyRTLSetting(locale: SupportedLocales): void {
    if (typeof window !== '
- **文件**: webview/i18n/I18nManager.ts
- **行号**: 581
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/connection.ts 第 90 行发现可疑模式: ${reconnectAttempts.value}
- **文件**: webview/stores/connection.ts
- **行号**: 90
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/connection.ts 第 90 行发现可疑模式: ${maxReconnectAttempts.value}
- **文件**: webview/stores/connection.ts
- **行号**: 90
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/connection.ts 第 92 行发现可疑模式: ${lastError.value}
- **文件**: webview/stores/connection.ts
- **行号**: 92
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/connection.ts 第 104 行发现可疑模式: ${hours}
- **文件**: webview/stores/connection.ts
- **行号**: 104
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/connection.ts 第 104 行发现可疑模式: ${minutes}
- **文件**: webview/stores/connection.ts
- **行号**: 104
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/connection.ts 第 104 行发现可疑模式: ${seconds}
- **文件**: webview/stores/connection.ts
- **行号**: 104
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/connection.ts 第 106 行发现可疑模式: ${minutes}
- **文件**: webview/stores/connection.ts
- **行号**: 106
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/connection.ts 第 106 行发现可疑模式: ${seconds}
- **文件**: webview/stores/connection.ts
- **行号**: 106
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/connection.ts 第 108 行发现可疑模式: ${seconds}
- **文件**: webview/stores/connection.ts
- **行号**: 108
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/connection.ts 第 136 行发现可疑模式: ', config);

      // 模拟连接过程
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 连接成功
      connectionState.value = ConnectionState.Connected;
      reconnectAttempts.value = 0;
      startUptimeTimer();

      // 添加到连接历史
      addToHistory(config, true);

    } catch (error) {
      connectionState.value = ConnectionState.Error;
      lastError.value = error instanceof Error ? error.message : String(error);
      stats.errors++;
      
      // 添加到连接历史
      addToHistory(config, false);
      
      // 尝试自动重连
      scheduleReconnect();
      
      throw error;
    }
  };

  /**
   * 断开连接
   */
  const disconnect = async (): Promise<void> => {
    try {
      stopUptimeTimer();
      stopReconnectTimer();
      
      // 通过消息桥梁发送断开连接请求
      console.log('
- **文件**: webview/stores/connection.ts
- **行号**: 136
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/connection.ts 第 191 行发现可疑模式: ');
    }

    reconnectAttempts.value++;
    connectionState.value = ConnectionState.Reconnecting;
    
    try {
      await connect(currentConfig.value);
      stats.reconnections++;
    } catch (error) {
      if (canReconnect.value) {
        scheduleReconnect();
      } else {
        connectionState.value = ConnectionState.Error;
        lastError.value = '
- **文件**: webview/stores/connection.ts
- **行号**: 191
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/data.ts 第 46 行发现可疑模式: ', () => {
  // === 状态 ===
  const state = reactive<DataStoreState>({
    currentFrame: null,
    frames: [],
    widgets: new Map(),
    isPaused: false,
    isRecording: false,
    maxFrameHistory: 1000,
    totalFramesReceived: 0,
    totalBytesReceived: 0,
    lastFrameTime: 0,
    dataBuffer: new Map(),
    bufferSize: 10000
  });

  const performanceMetrics = reactive<PerformanceMetrics>({
    updateFrequency: 0,
    processingLatency: 0,
    memoryUsage: 0,
    droppedFrames: 0,
    cpuUsage: 0
  });

  // === 计算属性 ===
  const isConnected = computed(() => state.currentFrame !== null);
  
  const activeWidgets = computed(() => 
    Array.from(state.widgets.values()).filter(widget => widget.isActive)
  );

  const totalDataPoints = computed(() => {
    let total = 0;
    for (const buffer of state.dataBuffer.values()) {
      total += buffer.length;
    }
    return total;
  });

  const averageUpdateRate = computed(() => {
    if (state.frames.length < 2) return 0;
    
    const recentFrames = state.frames.slice(-10);
    if (recentFrames.length < 2) return 0;
    
    const timeSpan = recentFrames[recentFrames.length - 1].timestamp - recentFrames[0].timestamp;
    return Math.round((recentFrames.length - 1) * 1000 / timeSpan);
  });

  const memoryUsage = computed(() => {
    // 估算内存使用情况（MB）
    const frameSize = state.frames.length * 1024; // 假设每帧1KB
    const widgetSize = state.widgets.size * 512;  // 假设每个widget 512B
    const bufferSize = totalDataPoints.value * 32; // 假设每个数据点32B
    
    return Math.round((frameSize + widgetSize + bufferSize) / (1024 * 1024));
  });

  // === 动作 ===

  /**
   * 初始化数据存储
   */
  const initialize = () => {
    console.log('
- **文件**: webview/stores/data.ts
- **行号**: 46
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/data.ts 第 110 行发现可疑模式: ');
    
    // 定期清理过期数据
    setInterval(cleanupExpiredData, 30000); // 每30秒清理一次
    
    // 定期更新性能指标
    setInterval(updatePerformanceMetrics, 1000); // 每秒更新一次
  };

  /**
   * 处理新的数据帧
   * @param frame 处理过的数据帧
   */
  const processFrame = (frame: ProcessedFrame) => {
    if (state.isPaused) {
      performanceMetrics.droppedFrames++;
      return;
    }

    const startTime = Date.now();

    try {
      // 更新当前帧
      state.currentFrame = frame;
      state.totalFramesReceived++;
      state.lastFrameTime = frame.timestamp;

      // 添加到历史记录
      state.frames.push(frame);
      
      // 限制历史记录大小
      if (state.frames.length > state.maxFrameHistory) {
        state.frames.shift();
      }

      // 处理每个组的数据
      for (const group of frame.groups) {
        processGroup(group, frame.timestamp);
      }

      // 更新性能指标
      performanceMetrics.processingLatency = Date.now() - startTime;
      
    } catch (error) {
      console.error('
- **文件**: webview/stores/data.ts
- **行号**: 110
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/layout.ts 第 209 行发现可疑模式: ${index + 1}
- **文件**: webview/stores/layout.ts
- **行号**: 209
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/layout.ts 第 226 行发现可疑模式: ${now}
- **文件**: webview/stores/layout.ts
- **行号**: 226
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/layout.ts 第 256 行发现可疑模式: ${layoutId}
- **文件**: webview/stores/layout.ts
- **行号**: 256
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/layout.ts 第 260 行发现可疑模式: ${now}
- **文件**: webview/stores/layout.ts
- **行号**: 260
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/layout.ts 第 268 行发现可疑模式: ${now}
- **文件**: webview/stores/layout.ts
- **行号**: 268
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/layout.ts 第 268 行发现可疑模式: ${Math.random().toString(36).substr(2, 9)}
- **文件**: webview/stores/layout.ts
- **行号**: 268
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/layout.ts 第 287 行发现可疑模式: ${layoutId}
- **文件**: webview/stores/layout.ts
- **行号**: 287
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/layout.ts 第 307 行发现可疑模式: ${layoutId}
- **文件**: webview/stores/layout.ts
- **行号**: 307
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/layout.ts 第 325 行发现可疑模式: ${Date.now()}
- **文件**: webview/stores/layout.ts
- **行号**: 325
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/layout.ts 第 325 行发现可疑模式: ${Math.random().toString(36).substr(2, 9)}
- **文件**: webview/stores/layout.ts
- **行号**: 325
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/layout.ts 第 451 行发现可疑模式: ${now}
- **文件**: webview/stores/layout.ts
- **行号**: 451
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/layout.ts 第 451 行发现可疑模式: ${Math.random().toString(36).substr(2, 9)}
- **文件**: webview/stores/layout.ts
- **行号**: 451
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/layout.ts 第 198 行发现可疑模式: ');
  };

  /**
   * 创建默认布局
   */
  const createDefaultLayouts = () => {
    const now = Date.now();
    
    const defaultLayouts = LAYOUT_TEMPLATES.map((template, index) => ({
      ...template,
      id: `layout-${index + 1}`,
      created: now,
      modified: now
    }));

    layouts.value = defaultLayouts;
    saveLayoutsToStorage();
  };

  /**
   * 创建新布局
   * @param name 布局名称
   * @param template 模板（可选）
   * @returns 新布局ID
   */
  const createLayout = (name: string, template?: Partial<LayoutConfig>): string => {
    const now = Date.now();
    const id = `layout-${now}`;
    
    const newLayout: LayoutConfig = {
      id,
      name,
      description: template?.description || '
- **文件**: webview/stores/layout.ts
- **行号**: 198
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/layout.ts 第 322 行发现可疑模式: ');
    }

    const itemId = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newItem: LayoutItem = {
      id: itemId,
      widgetId,
      position: { ...position },
      isVisible: true,
      isResizable: true,
      isDraggable: true
    };

    currentLayout.value.items.push(newItem);
    updateLayoutModified();
    saveLayoutsToStorage();
    
    return itemId;
  };

  /**
   * 移除布局项
   * @param itemId 布局项ID
   */
  const removeItem = (itemId: string) => {
    if (!currentLayout.value) return;

    const index = currentLayout.value.items.findIndex(item => item.id === itemId);
    if (index !== -1) {
      currentLayout.value.items.splice(index, 1);
      
      // 从选中项中移除
      const selectedIndex = selectedItems.value.indexOf(itemId);
      if (selectedIndex !== -1) {
        selectedItems.value.splice(selectedIndex, 1);
      }

      updateLayoutModified();
      saveLayoutsToStorage();
    }
  };

  /**
   * 更新Widget位置
   * @param itemId 布局项ID  
   * @param position 新位置
   */
  const updateItemPosition = (itemId: string, position: Partial<WidgetPosition>) => {
    if (!currentLayout.value) return;

    const item = currentLayout.value.items.find(item => item.id === itemId);
    if (item) {
      Object.assign(item.position, position);
      
      // 对齐到网格
      if (currentLayout.value.snapToGrid) {
        snapToGrid(item.position);
      }

      updateLayoutModified();
      saveLayoutsToStorage();
    }
  };

  /**
   * 更新Widget大小
   * @param itemId 布局项ID
   * @param size 新大小
   */
  const updateItemSize = (itemId: string, size: { width: number; height: number }) => {
    updateItemPosition(itemId, size);
  };

  /**
   * 对齐到网格
   * @param position 位置信息
   */
  const snapToGrid = (position: WidgetPosition) => {
    const gridSize = currentLayout.value?.gridSize || viewSettings.gridSize;
    
    position.x = Math.round(position.x / gridSize) * gridSize;
    position.y = Math.round(position.y / gridSize) * gridSize;
    position.width = Math.round(position.width / gridSize) * gridSize;
    position.height = Math.round(position.height / gridSize) * gridSize;
  };

  /**
   * 选择布局项
   * @param itemIds 布局项ID数组
   * @param addToSelection 是否添加到当前选择（默认false，即替换选择）
   */
  const selectItems = (itemIds: string[], addToSelection = false) => {
    if (addToSelection) {
      selectedItems.value = [...new Set([...selectedItems.value, ...itemIds])];
    } else {
      selectedItems.value = [...itemIds];
    }
  };

  /**
   * 清除选择
   */
  const clearSelection = () => {
    selectedItems.value = [];
  };

  /**
   * 复制选中的项到剪贴板
   */
  const copySelected = () => {
    if (!currentLayout.value) return;

    clipboard.value = selectedItems.value
      .map(itemId => currentLayout.value!.items.find(item => item.id === itemId))
      .filter(item => item !== undefined) as LayoutItem[];
  };

  /**
   * 粘贴剪贴板中的项
   */
  const paste = () => {
    if (!currentLayout.value || clipboard.value.length === 0) return;

    const now = Date.now();
    const offset = 20; // 粘贴偏移量

    const newItems = clipboard.value.map(item => ({
      ...item,
      id: `item-${now}-${Math.random().toString(36).substr(2, 9)}`,
      position: {
        ...item.position,
        x: item.position.x + offset,
        y: item.position.y + offset
      }
    }));

    currentLayout.value.items.push(...newItems);
    selectItems(newItems.map(item => item.id));
    
    updateLayoutModified();
    saveLayoutsToStorage();
  };

  /**
   * 删除选中的项
   */
  const deleteSelected = () => {
    selectedItems.value.forEach(itemId => {
      removeItem(itemId);
    });
    clearSelection();
  };

  /**
   * 设置编辑模式
   * @param enabled 是否启用编辑模式
   */
  const setEditMode = (enabled: boolean) => {
    isEditMode.value = enabled;
    
    if (!enabled) {
      clearSelection();
    }
  };

  /**
   * 自动布局
   * @param type 布局类型
   */
  const autoLayout = (type: '
- **文件**: webview/stores/layout.ts
- **行号**: 322
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/layout.ts 第 507 行发现可疑模式: ':
        layoutAsFlow(items, containerWidth, padding);
        break;
    }

    updateLayoutModified();
    saveLayoutsToStorage();
  };

  /**
   * 网格布局
   */
  const layoutAsGrid = (items: LayoutItem[], containerWidth: number, containerHeight: number, padding: number) => {
    const cols = Math.ceil(Math.sqrt(items.length));
    const rows = Math.ceil(items.length / cols);
    
    const itemWidth = (containerWidth - padding * (cols + 1)) / cols;
    const itemHeight = (containerHeight - padding * (rows + 1)) / rows;

    items.forEach((item, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      item.position.x = padding + col * (itemWidth + padding);
      item.position.y = padding + row * (itemHeight + padding);
      item.position.width = itemWidth;
      item.position.height = itemHeight;
    });
  };

  /**
   * 堆叠布局
   */
  const layoutAsStack = (items: LayoutItem[], containerWidth: number, padding: number) => {
    const itemWidth = containerWidth - padding * 2;
    const itemHeight = 200; // 固定高度

    items.forEach((item, index) => {
      item.position.x = padding;
      item.position.y = padding + index * (itemHeight + padding);
      item.position.width = itemWidth;
      item.position.height = itemHeight;
    });
  };

  /**
   * 流式布局
   */
  const layoutAsFlow = (items: LayoutItem[], containerWidth: number, padding: number) => {
    let currentX = padding;
    let currentY = padding;
    let rowHeight = 0;

    items.forEach(item => {
      const itemWidth = Math.max(item.position.width, 200);
      const itemHeight = Math.max(item.position.height, 200);

      // 如果当前行放不下，换行
      if (currentX + itemWidth > containerWidth - padding) {
        currentX = padding;
        currentY += rowHeight + padding;
        rowHeight = 0;
      }

      item.position.x = currentX;
      item.position.y = currentY;
      item.position.width = itemWidth;
      item.position.height = itemHeight;

      currentX += itemWidth + padding;
      rowHeight = Math.max(rowHeight, itemHeight);
    });
  };

  /**
   * 更新布局修改时间
   */
  const updateLayoutModified = () => {
    if (currentLayout.value) {
      currentLayout.value.modified = Date.now();
    }
  };

  // === 本地存储方法 ===

  /**
   * 保存布局到本地存储
   */
  const saveLayoutsToStorage = () => {
    localStorage.setItem('
- **文件**: webview/stores/layout.ts
- **行号**: 507
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/performance.ts 第 362 行发现可疑模式: ${sample.fps}
- **文件**: webview/stores/performance.ts
- **行号**: 362
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/performance.ts 第 364 行发现可疑模式: ${sample.fps}
- **文件**: webview/stores/performance.ts
- **行号**: 364
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/performance.ts 第 369 行发现可疑模式: ${sample.memory}
- **文件**: webview/stores/performance.ts
- **行号**: 369
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/performance.ts 第 371 行发现可疑模式: ${sample.memory}
- **文件**: webview/stores/performance.ts
- **行号**: 371
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/performance.ts 第 376 行发现可疑模式: ${sample.latency}
- **文件**: webview/stores/performance.ts
- **行号**: 376
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/performance.ts 第 378 行发现可疑模式: ${sample.latency}
- **文件**: webview/stores/performance.ts
- **行号**: 378
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/performance.ts 第 383 行发现可疑模式: ${sample.cpu}
- **文件**: webview/stores/performance.ts
- **行号**: 383
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/performance.ts 第 385 行发现可疑模式: ${sample.cpu}
- **文件**: webview/stores/performance.ts
- **行号**: 385
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/performance.ts 第 394 行发现可疑模式: ${type}
- **文件**: webview/stores/performance.ts
- **行号**: 394
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/performance.ts 第 394 行发现可疑模式: ${level}
- **文件**: webview/stores/performance.ts
- **行号**: 394
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/performance.ts 第 394 行发现可疑模式: ${Date.now()}
- **文件**: webview/stores/performance.ts
- **行号**: 394
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/performance.ts 第 423 行发现可疑模式: ${level.toUpperCase()}
- **文件**: webview/stores/performance.ts
- **行号**: 423
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/performance.ts 第 423 行发现可疑模式: ${message}
- **文件**: webview/stores/performance.ts
- **行号**: 423
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/performance.ts 第 436 行发现可疑模式: ${monitoringConfig.sampleInterval}
- **文件**: webview/stores/performance.ts
- **行号**: 436
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/performance.ts 第 65 行发现可疑模式: ', () => {
  // === 状态 ===
  const isMonitoring = ref(false);
  const samples = ref<PerformanceSample[]>([]);
  const alerts = ref<PerformanceAlert[]>([]);
  const thresholds = ref<PerformanceThresholds>({ ...DEFAULT_THRESHOLDS });
  
  // 当前性能指标
  const currentMetrics = reactive<PerformanceMetrics>({
    updateFrequency: 0,
    processingLatency: 0,
    memoryUsage: 0,
    droppedFrames: 0,
    cpuUsage: 0
  });

  // 实时性能数据
  const realtimeStats = reactive({
    fps: 0,
    averageFps: 0,
    minFps: Infinity,
    maxFps: 0,
    frameTime: 0,
    averageFrameTime: 0,
    lastFrameTime: 0,
    totalFrames: 0,
    droppedFrames: 0,
    droppedFrameRate: 0
  });

  // 监控配置
  const monitoringConfig = reactive({
    sampleInterval: 1000,      // 采样间隔(ms)
    maxSamples: 300,           // 最大保留样本数(5分钟)
    enableAlerts: true,        // 是否启用性能警告
    autoOptimize: false        // 是否自动优化性能
  });

  // === 内部状态 ===
  let monitoringTimer: NodeJS.Timeout | null = null;
  let frameCount = 0;
  let lastFpsTime = Date.now();
  let lastFrameTimestamp = 0;
  let performanceObserver: PerformanceObserver | null = null;

  // === 计算属性 ===
  const fps = computed(() => realtimeStats.fps);
  const latency = computed(() => currentMetrics.processingLatency);
  const memoryUsage = computed(() => currentMetrics.memoryUsage);
  const cpuUsage = computed(() => currentMetrics.cpuUsage || 0);

  const averagePerformance = computed(() => {
    if (samples.value.length === 0) {
      return {
        fps: 0,
        latency: 0,
        memory: 0,
        cpu: 0
      };
    }

    const recent = samples.value.slice(-60); // 最近1分钟的数据
    const total = recent.reduce(
      (acc, sample) => ({
        fps: acc.fps + sample.fps,
        latency: acc.latency + sample.latency,
        memory: acc.memory + sample.memory,
        cpu: acc.cpu + (sample.cpu || 0)
      }),
      { fps: 0, latency: 0, memory: 0, cpu: 0 }
    );

    return {
      fps: Math.round(total.fps / recent.length),
      latency: Math.round(total.latency / recent.length),
      memory: Math.round(total.memory / recent.length),
      cpu: Math.round(total.cpu / recent.length)
    };
  });

  const performanceGrade = computed(() => {
    const avg = averagePerformance.value;
    
    // 基于多个指标计算性能等级
    let score = 100;
    
    // FPS评分 (30%)
    if (avg.fps < thresholds.value.fps.critical) score -= 30;
    else if (avg.fps < thresholds.value.fps.warning) score -= 15;
    
    // 内存评分 (25%)
    if (avg.memory > thresholds.value.memory.critical) score -= 25;
    else if (avg.memory > thresholds.value.memory.warning) score -= 12;
    
    // 延迟评分 (25%)
    if (avg.latency > thresholds.value.latency.critical) score -= 25;
    else if (avg.latency > thresholds.value.latency.warning) score -= 12;
    
    // CPU评分 (20%)
    if (avg.cpu > thresholds.value.cpu.critical) score -= 20;
    else if (avg.cpu > thresholds.value.cpu.warning) score -= 10;
    
    if (score >= 90) return { grade: '
- **文件**: webview/stores/performance.ts
- **行号**: 65
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/performance.ts 第 237 行发现可疑模式: ');
  };

  /**
   * 记录帧渲染
   */
  const recordFrame = () => {
    frameCount++;
    const now = Date.now();
    
    // 计算帧时间
    if (lastFrameTimestamp > 0) {
      realtimeStats.frameTime = now - lastFrameTimestamp;
      realtimeStats.averageFrameTime = 
        (realtimeStats.averageFrameTime * 0.9) + (realtimeStats.frameTime * 0.1);
    }
    
    lastFrameTimestamp = now;
    realtimeStats.totalFrames++;

    // 每秒计算一次FPS
    if (now - lastFpsTime >= 1000) {
      const fps = Math.round((frameCount * 1000) / (now - lastFpsTime));
      
      realtimeStats.fps = fps;
      realtimeStats.averageFps = 
        (realtimeStats.averageFps * 0.8) + (fps * 0.2);
      realtimeStats.minFps = Math.min(realtimeStats.minFps, fps);
      realtimeStats.maxFps = Math.max(realtimeStats.maxFps, fps);
      
      frameCount = 0;
      lastFpsTime = now;
      
      // 更新全局FPS指标
      currentMetrics.updateFrequency = fps;
    }
  };

  /**
   * 记录丢帧
   */
  const recordDroppedFrame = () => {
    realtimeStats.droppedFrames++;
    currentMetrics.droppedFrames++;
    
    // 计算丢帧率
    if (realtimeStats.totalFrames > 0) {
      realtimeStats.droppedFrameRate = 
        (realtimeStats.droppedFrames / realtimeStats.totalFrames) * 100;
    }
  };

  /**
   * 更新延迟指标
   * @param latency 延迟时间(ms)
   */
  const updateLatency = (latency: number) => {
    currentMetrics.processingLatency = latency;
  };

  /**
   * 更新内存使用情况
   * @param memoryMB 内存使用量(MB)
   */
  const updateMemoryUsage = (memoryMB: number) => {
    currentMetrics.memoryUsage = memoryMB;
  };

  /**
   * 更新CPU使用率
   * @param cpuPercent CPU使用率(%)
   */
  const updateCpuUsage = (cpuPercent: number) => {
    currentMetrics.cpuUsage = cpuPercent;
  };

  /**
   * 收集性能样本
   */
  const collectSample = () => {
    const now = Date.now();
    
    // 估算内存使用情况
    let memoryUsage = currentMetrics.memoryUsage;
    if (typeof performance !== '
- **文件**: webview/stores/performance.ts
- **行号**: 237
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/performance.ts 第 392 行发现可疑模式: '], 
                   message: string, value: number, threshold: number) => {
    const alertId = `${type}-${level}-${Date.now()}`;
    
    // 避免重复警告（1分钟内同类型警告只发送一次）
    const recentSimilar = alerts.value.find(alert => 
      alert.type === type && 
      alert.level === level && 
      Date.now() - alert.timestamp < 60000
    );
    
    if (recentSimilar) return;

    const alert: PerformanceAlert = {
      id: alertId,
      type,
      level,
      message,
      timestamp: Date.now(),
      value,
      threshold
    };

    alerts.value.push(alert);

    // 限制警告数量
    if (alerts.value.length > 50) {
      alerts.value = alerts.value.slice(-50);
    }

    // 发送警告事件
    console.warn(`性能警告 [${level.toUpperCase()}]: ${message}`);
  };

  /**
   * 自动性能优化
   * @param sample 性能样本
   */
  const autoOptimizePerformance = (sample: PerformanceSample) => {
    // 如果FPS过低，尝试优化
    if (sample.fps < thresholds.value.fps.warning) {
      // 降低更新频率
      if (monitoringConfig.sampleInterval < 2000) {
        monitoringConfig.sampleInterval += 200;
        console.log(`自动优化: 降低采样频率至 ${monitoringConfig.sampleInterval}ms`);
      }
    }

    // 如果内存使用过高，尝试清理
    if (sample.memory > thresholds.value.memory.warning) {
      // 清理旧样本
      if (samples.value.length > 100) {
        samples.value = samples.value.slice(-100);
        console.log('
- **文件**: webview/stores/performance.ts
- **行号**: 392
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/projectStore.ts 第 176 行发现可疑模式: ${key.charAt(0).toUpperCase()}
- **文件**: webview/stores/projectStore.ts
- **行号**: 176
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/projectStore.ts 第 176 行发现可疑模式: ${key.slice(1)}
- **文件**: webview/stores/projectStore.ts
- **行号**: 176
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/projectStore.ts 第 356 行发现可疑模式: ${dataset.title}
- **文件**: webview/stores/projectStore.ts
- **行号**: 356
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/projectStore.ts 第 356 行发现可疑模式: ${group.title}
- **文件**: webview/stores/projectStore.ts
- **行号**: 356
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/projectStore.ts 第 44 行发现可疑模式: ';
  });

  const groupCount = computed(() => {
    return currentProject.value?.groups.length || 0;
  });

  const datasetCount = computed(() => {
    if (!currentProject.value) return 0;
    
    return currentProject.value.groups.reduce((total, group) => {
      return total + group.datasets.length;
    }, 0);
  });

  const actionCount = computed(() => {
    return currentProject.value?.actions.length || 0;
  });

  const containsCommercialFeatures = computed(() => {
    // 检查是否包含商业版特性
    if (!currentProject.value) return false;
    
    // 检查是否使用了商业版组件
    for (const group of currentProject.value.groups) {
      if (['
- **文件**: webview/stores/projectStore.ts
- **行号**: 44
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/projectStore.ts 第 351 行发现可疑模式: '];
    
    if (currentProject.value) {
      for (const group of currentProject.value.groups) {
        for (const dataset of group.datasets) {
          sources.push(`${dataset.title} (${group.title})`);
        }
      }
    }
    
    return sources;
  };

  /**
   * 获取已使用的数据集索引
   */
  const getUsedIndices = (): number[] => {
    const indices: number[] = [];
    
    if (currentProject.value) {
      for (const group of currentProject.value.groups) {
        for (const dataset of group.datasets) {
          indices.push(dataset.index);
        }
      }
    }
    
    return indices.sort((a, b) => a - b);
  };

  /**
   * 获取重复的数据集索引
   */
  const getDuplicateIndices = (): number[] => {
    const indices = getUsedIndices();
    const duplicates: number[] = [];
    const seen = new Set<number>();
    
    for (const index of indices) {
      if (seen.has(index)) {
        if (!duplicates.includes(index)) {
          duplicates.push(index);
        }
      } else {
        seen.add(index);
      }
    }
    
    return duplicates;
  };

  /**
   * 获取下一个可用的数据集索引
   */
  const getNextAvailableIndex = (): number => {
    const usedIndices = getUsedIndices();
    let nextIndex = 1;
    
    while (usedIndices.includes(nextIndex)) {
      nextIndex++;
    }
    
    return nextIndex;
  };

  // ================== 消息处理 ==================

  /**
   * 处理来自VSCode扩展的消息
   */
  const handleMessage = (message: any): void => {
    switch (message.type) {
      case '
- **文件**: webview/stores/projectStore.ts
- **行号**: 351
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/theme.ts 第 266 行发现可疑模式: ${themeId}
- **文件**: webview/stores/theme.ts
- **行号**: 266
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/theme.ts 第 320 行发现可疑模式: ${effectiveThemeType.value}
- **文件**: webview/stores/theme.ts
- **行号**: 320
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/theme.ts 第 388 行发现可疑模式: ${themeId}
- **文件**: webview/stores/theme.ts
- **行号**: 388
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/stores/theme.ts 第 409 行发现可疑模式: ${error instanceof Error ? error.message : String(error)}
- **文件**: webview/stores/theme.ts
- **行号**: 409
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 266 行发现可疑模式: ${performanceGPS.responseTime.toFixed(2)}
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 266
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 290 行发现可疑模式: ${trajectory.length}
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 290
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 290 行发现可疑模式: ${trajectoryLength}
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 290
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 293 行发现可疑模式: ${trajectoryLength}
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 293
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 309 行发现可疑模式: ${layer}
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 309
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 351 行发现可疑模式: ${renderInfo.vertices}
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 351
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 351 行发现可疑模式: ${renderInfo.faces}
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 351
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 437 行发现可疑模式: ${performanceFFT.samplesPerSecond.toFixed(0)}
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 437
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 454 行发现可疑模式: ${windowFunc}
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 454
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 491 行发现可疑模式: ${processedCount}
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 491
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 491 行发现可疑模式: ${sampleCount}
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 491
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 494 行发现可疑模式: ${processedCount}
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 494
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 523 行发现可疑模式: ${chartInfo.seriesCount}
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 523
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 526 行发现可疑模式: ${chartInfo.seriesCount}
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 526
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 541 行发现可疑模式: ${visibleCount}
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 541
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 550 行发现可疑模式: ${visibleCount}
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 550
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 571 行发现可疑模式: ${mode}
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 571
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 726 行发现可疑模式: ${actual.toFixed(2)}
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 726
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 726 行发现可疑模式: ${unit}
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 726
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 726 行发现可疑模式: ${reverse ? '≤' : '≥'}
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 726
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 726 行发现可疑模式: ${target}
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 726
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 726 行发现可疑模式: ${unit}
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 726
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 727 行发现可疑模式: ${name}
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 727
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 178 行发现可疑模式: ',
  active: true,
  groups: [],
  value: new Array(1024).fill(0).map((_, i) => 
    Math.sin(2 * Math.PI * 50 * i / 1024) + // 50Hz信号
    0.5 * Math.sin(2 * Math.PI * 120 * i / 1024) + // 120Hz信号
    0.1 * Math.random() // 噪声
  )
})

const multiPlotTestData = ref<Dataset>({
  id: '
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 178
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 320 行发现可疑模式: ', false, error.message)
  }
}

// 3D组件测试
const test3DBasic = async () => {
  try {
    performance3D.startTime = performance.now()
    performance3D.frameCount = 0
    
    // 生成测试3D数据
    const testPoints: Point3D[] = []
    for (let i = 0; i < 100; i++) {
      testPoints.push({
        x: Math.random() * 10 - 5,
        y: Math.random() * 10 - 5,
        z: Math.random() * 10 - 5,
        value: Math.random()
      })
    }
    
    plot3DTestData.value.value = testPoints
    
    // 验证渲染
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (!plot3DWidget.value?.isRendering()) {
      throw new Error('
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 320
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 418 行发现可疑模式: ')
    }
    
    // 检查主要频率峰值
    const frequencies = result.map((_, i) => i * 1024 / result.length)
    const magnitudes = result.map(complex => Math.sqrt(complex.real ** 2 + complex.imag ** 2))
    
    // 寻找50Hz和120Hz峰值
    const peak50 = findFrequencyPeak(frequencies, magnitudes, 50, 5)
    const peak120 = findFrequencyPeak(frequencies, magnitudes, 120, 10)
    
    if (!peak50 || !peak120) {
      throw new Error('
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 418
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 430 行发现可疑模式: ')
    }
    
    performanceFFT.processedSamples += fftTestData.value.value.length
    const elapsed = (performance.now() - performanceFFT.startTime) / 1000
    performanceFFT.samplesPerSecond = performanceFFT.processedSamples / elapsed
    
    addTestResult('
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 430
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 461 行发现可疑模式: ', false, error.message)
  }
}

const testFFTRealtime = async () => {
  try {
    // 模拟实时数据流
    const sampleCount = 10
    let processedCount = 0
    
    const processRealTimeData = async () => {
      // 生成实时信号
      const realtimeData = new Array(512).fill(0).map((_, i) => 
        Math.sin(2 * Math.PI * (50 + Math.random() * 10) * i / 512) + 
        0.1 * Math.random()
      )
      
      const result = await fftWidget.value.performFFT(realtimeData)
      if (result && result.length > 0) {
        processedCount++
      }
    }
    
    // 连续处理多次
    for (let i = 0; i < sampleCount; i++) {
      await processRealTimeData()
      await new Promise(resolve => setTimeout(resolve, 10))
    }
    
    if (processedCount !== sampleCount) {
      throw new Error(`实时处理失败: ${processedCount}/${sampleCount}`)
    }
    
    addTestResult('
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 461
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 497 行发现可疑模式: ', false, error.message)
  }
}

// 多数据图表测试
const testMultiBasic = async () => {
  try {
    performanceMulti.startTime = performance.now()
    performanceMulti.updateCount = 0
    
    // 生成多条曲线数据
    const timeStamps = Array.from({length: 100}, (_, i) => i)
    
    multiPlotTestData.value.value.series.forEach((series, index) => {
      series.data = timeStamps.map(t => ({
        x: t,
        y: Math.sin(2 * Math.PI * (0.1 + index * 0.05) * t) + 0.1 * Math.random()
      }))
    })
    
    await multiPlotWidget.value.updateChart()
    performanceMulti.updateCount++
    
    // 验证曲线渲染
    const chartInfo = multiPlotWidget.value.getChartInfo()
    if (chartInfo.seriesCount !== 3) {
      throw new Error(`曲线数量不匹配: 期望3, 实际${chartInfo.seriesCount}`)
    }
    
    addTestResult('
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 497
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 613 行发现可疑模式: ')
  
  // 重置性能计数器
  performance3D.fps = 0
  performance3D.frameCount = 0
  performance3D.startTime = performance.now()
  
  performanceGPS.responseTime = 0
  performanceFFT.samplesPerSecond = 0
  performanceMulti.updateRate = 0
  
  // 启动性能监控
  startPerformanceMonitoring()
  
  // 运行高强度测试
  await runStressTest()
  
  // 验证性能指标
  validatePerformanceTargets()
}

const runStressTest = async () => {
  // 3D高频渲染测试
  const render3DLoop = async () => {
    for (let i = 0; i < 60; i++) { // 1秒60帧
      await plot3DWidget.value?.render()
      performance3D.frameCount++
      await new Promise(resolve => setTimeout(resolve, 16)) // ~60fps
    }
  }
  
  // GPS高频更新测试
  const gpsUpdateLoop = async () => {
    for (let i = 0; i < 20; i++) { // 20次更新
      const start = performance.now()
      await gpsWidget.value?.updatePosition({
        lat: 39.9042 + Math.random() * 0.01,
        lng: 116.4074 + Math.random() * 0.01,
        alt: 50 + Math.random() * 10,
        speed: Math.random() * 50,
        course: Math.random() * 360
      })
      const responseTime = performance.now() - start
      performanceGPS.responseTime = Math.max(performanceGPS.responseTime, responseTime)
      await new Promise(resolve => setTimeout(resolve, 50))
    }
  }
  
  // FFT高速处理测试
  const fftProcessLoop = async () => {
    const startTime = performance.now()
    let sampleCount = 0
    
    for (let i = 0; i < 100; i++) { // 100次FFT计算
      const testData = new Array(1024).fill(0).map(() => Math.random())
      await fftWidget.value?.performFFT(testData)
      sampleCount += testData.length
    }
    
    const elapsed = (performance.now() - startTime) / 1000
    performanceFFT.samplesPerSecond = sampleCount / elapsed
  }
  
  // 多图表高频更新测试
  const multiPlotUpdateLoop = async () => {
    const startTime = performance.now()
    let updateCount = 0
    
    for (let i = 0; i < 50; i++) { // 50次更新
      // 模拟数据更新
      multiPlotTestData.value.value.series.forEach(series => {
        series.data.push({
          x: series.data.length,
          y: Math.random()
        })
        if (series.data.length > 1000) {
          series.data.shift()
        }
      })
      
      await multiPlotWidget.value?.updateChart()
      updateCount++
      await new Promise(resolve => setTimeout(resolve, 20))
    }
    
    const elapsed = (performance.now() - startTime) / 1000
    performanceMulti.updateRate = updateCount / elapsed
  }
  
  // 并行执行所有压力测试
  await Promise.all([
    render3DLoop(),
    gpsUpdateLoop(),
    fftProcessLoop(),
    multiPlotUpdateLoop()
  ])
}

const validatePerformanceTargets = () => {
  // 计算3D帧率
  const elapsed3D = (performance.now() - performance3D.startTime) / 1000
  performance3D.fps = performance3D.frameCount / elapsed3D
  
  // 验证性能目标
  const targets = {
    '
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 613
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 726 行发现可疑模式: '} ${target} ${unit})`
    addTestResult(`性能-${name}`, passed, detail)
  })
}

// 辅助函数
const findFrequencyPeak = (frequencies: number[], magnitudes: number[], targetFreq: number, tolerance: number) => {
  for (let i = 0; i < frequencies.length; i++) {
    if (Math.abs(frequencies[i] - targetFreq) <= tolerance) {
      // 检查是否为局部最大值
      const leftOk = i === 0 || magnitudes[i] >= magnitudes[i - 1]
      const rightOk = i === magnitudes.length - 1 || magnitudes[i] >= magnitudes[i + 1]
      if (leftOk && rightOk && magnitudes[i] > 0.1) { // 阈值检查
        return { frequency: frequencies[i], magnitude: magnitudes[i] }
      }
    }
  }
  return null
}

const startPerformanceMonitoring = () => {
  if (performanceTimer) {
    clearInterval(performanceTimer)
  }
  
  performanceTimer = setInterval(() => {
    // 实时更新性能指标显示
    // 这里的值已经在各个测试函数中更新
  }, 100)
}

const clearResults = () => {
  testResults.value = []
}

// 事件处理
const onGPSUpdate = (data: any) => {
  // GPS更新处理
}

const on3DUpdate = (data: any) => {
  // 3D更新处理
}

const onFFTUpdate = (data: any) => {
  // FFT更新处理
}

const onMultiPlotUpdate = (data: any) => {
  // 多图表更新处理
}

// 生命周期
onMounted(() => {
  console.log('
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 726
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 63 行发现可疑模式: ${fps.toFixed(2)}
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 63
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 114 行发现可疑模式: ${avgResponseTime.toFixed(2)}
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 114
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 114 行发现可疑模式: ${maxResponseTime.toFixed(2)}
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 114
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 151 行发现可疑模式: ${samplesPerSecond.toFixed(0)}
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 151
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 171 行发现可疑模式: ${seriesIndex}
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 171
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 190 行发现可疑模式: ${updateRate.toFixed(2)}
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 190
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 221 行发现可疑模式: ${this.metrics.memoryUsage.toFixed(2)}
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 221
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 221 行发现可疑模式: ${this.metrics.cpuUsage.toFixed(1)}
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 221
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 250 行发现可疑模式: ${totalTime.toFixed(2)}
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 250
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 279 行发现可疑模式: ${actualValue.toFixed(2)}
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 279
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 279 行发现可疑模式: ${target.unit}
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 279
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 279 行发现可疑模式: ${operator}
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 279
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 279 行发现可疑模式: ${target.target}
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 279
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 279 行发现可疑模式: ${target.unit}
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 279
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 282 行发现可疑模式: ${status}
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 282
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 282 行发现可疑模式: ${target.name}
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 282
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 282 行发现可疑模式: ${detail}
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 282
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 294 行发现可疑模式: ${passedCount}
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 294
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 294 行发现可疑模式: ${totalCount}
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 294
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 294 行发现可疑模式: ${(passedCount/totalCount*100).toFixed(1)}
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 294
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 325 行发现可疑模式: ${position.lat}
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 325
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 325 行发现可疑模式: ${position.lng}
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 325
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 386 行发现可疑模式: ${new Date().toLocaleString()}
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 386
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 387 行发现可疑模式: ${navigator.userAgent}
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 387
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 398 行发现可疑模式: ${target.name}
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 398
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 398 行发现可疑模式: ${value.toFixed(2)}
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 398
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 398 行发现可疑模式: ${target.unit}
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 398
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 398 行发现可疑模式: ${operator}
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 398
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 398 行发现可疑模式: ${target.target}
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 398
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 398 行发现可疑模式: ${target.unit}
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 398
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 398 行发现可疑模式: ${status}
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 398
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 435 行发现可疑模式: ${reportPath}
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 435
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 448 行发现可疑模式: ${totalCount - passedCount}
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 448
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 46 行发现可疑模式: ')
    
    const testDuration = 2000 // 2秒测试
    const frameInterval = 16.67 // 60fps目标间隔
    
    let frameCount = 0
    const startTime = performance.now()
    
    return new Promise((resolve) => {
      const renderLoop = () => {
        const currentTime = performance.now()
        
        if (currentTime - startTime >= testDuration) {
          const actualDuration = (currentTime - startTime) / 1000
          const fps = frameCount / actualDuration
          this.metrics.fps3D = fps
          
          console.log(`✅ 3D渲染测试完成: ${fps.toFixed(2)} FPS`)
          resolve(fps)
          return
        }

        // 模拟3D渲染工作负载
        this.simulate3DRenderWork()
        frameCount++
        
        // 使用requestAnimationFrame确保与浏览器渲染同步
        requestAnimationFrame(renderLoop)
      }
      
      requestAnimationFrame(renderLoop)
    })
  }

  /**
   * 运行GPS响应时间测试
   */
  async benchmarkGPSResponse(): Promise<number> {
    console.log('
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 46
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 84 行发现可疑模式: ')
    
    const testCount = 50
    const responseTimes: number[] = []
    
    for (let i = 0; i < testCount; i++) {
      const startTime = performance.now()
      
      // 模拟GPS数据更新
      await this.simulateGPSUpdate({
        lat: 39.9042 + (Math.random() - 0.5) * 0.1,
        lng: 116.4074 + (Math.random() - 0.5) * 0.1,
        alt: 50 + Math.random() * 100,
        speed: Math.random() * 60,
        course: Math.random() * 360
      })
      
      const responseTime = performance.now() - startTime
      responseTimes.push(responseTime)
      
      // 避免过度频繁的测试
      await new Promise(resolve => setTimeout(resolve, 10))
    }
    
    // 计算平均响应时间
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    const maxResponseTime = Math.max(...responseTimes)
    
    this.metrics.gpsResponseTime = maxResponseTime // 使用最大值作为指标
    
    console.log(`✅ GPS响应测试完成: 平均 ${avgResponseTime.toFixed(2)}ms, 最大 ${maxResponseTime.toFixed(2)}ms`)
    return maxResponseTime
  }

  /**
   * 运行FFT处理性能测试
   */
  async benchmarkFFTProcessing(): Promise<number> {
    console.log('
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 84
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 122 行发现可疑模式: ')
    
    const testDuration = 3000 // 3秒测试
    const fftSize = 1024
    
    let totalSamples = 0
    const startTime = performance.now()
    
    while (performance.now() - startTime < testDuration) {
      // 生成测试信号
      const testData = new Array(fftSize).fill(0).map((_, i) => {
        return Math.sin(2 * Math.PI * 50 * i / fftSize) + // 50Hz信号
               0.5 * Math.sin(2 * Math.PI * 120 * i / fftSize) + // 120Hz信号
               0.1 * (Math.random() - 0.5) // 噪声
      })
      
      // 执行FFT计算
      await this.simulateFFTCalculation(testData)
      totalSamples += fftSize
      
      // 短暂延迟模拟实际使用情况
      await new Promise(resolve => setTimeout(resolve, 1))
    }
    
    const actualDuration = (performance.now() - startTime) / 1000
    const samplesPerSecond = totalSamples / actualDuration
    
    this.metrics.fftSamplesPerSecond = samplesPerSecond
    
    console.log(`✅ FFT处理测试完成: ${samplesPerSecond.toFixed(0)} samples/s`)
    return samplesPerSecond
  }

  /**
   * 运行多图表更新性能测试
   */
  async benchmarkMultiPlotUpdates(): Promise<number> {
    console.log('
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 122
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 159 行发现可疑模式: ')
    
    const testDuration = 2000 // 2秒测试
    const seriesCount = 5
    const pointsPerUpdate = 10
    
    let updateCount = 0
    const startTime = performance.now()
    
    while (performance.now() - startTime < testDuration) {
      // 模拟多系列数据更新
      const updateData = Array.from({ length: seriesCount }, (_, seriesIndex) => ({
        seriesId: `series-${seriesIndex}`,
        points: Array.from({ length: pointsPerUpdate }, (_, pointIndex) => ({
          x: Date.now() + pointIndex,
          y: Math.sin(2 * Math.PI * (seriesIndex + 1) * pointIndex / 100) + Math.random() * 0.2
        }))
      }))
      
      await this.simulateMultiPlotUpdate(updateData)
      updateCount++
      
      // 控制更新频率
      await new Promise(resolve => setTimeout(resolve, 20))
    }
    
    const actualDuration = (performance.now() - startTime) / 1000
    const updateRate = updateCount / actualDuration
    
    this.metrics.multiPlotUpdateRate = updateRate
    
    console.log(`✅ 多图表更新测试完成: ${updateRate.toFixed(2)} Hz`)
    return updateRate
  }

  /**
   * 监控系统资源使用
   */
  async monitorSystemResources(): Promise<void> {
    console.log('
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 159
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 201 行发现可疑模式: ' in performance) {
      const memInfo = (performance as any).memory
      this.metrics.memoryUsage = memInfo.usedJSHeapSize / (1024 * 1024) // MB
    }
    
    // CPU使用率监控（简化版）
    const cpuStart = performance.now()
    let iterations = 0
    const maxTime = 100 // 100ms采样时间
    
    while (performance.now() - cpuStart < maxTime) {
      // 执行一些计算密集型操作
      Math.sqrt(Math.random() * 1000000)
      iterations++
    }
    
    const actualTime = performance.now() - cpuStart
    const estimatedCPU = Math.min((iterations / 100000) * 100, 100) // 粗略估算
    this.metrics.cpuUsage = estimatedCPU
    
    console.log(`✅ 资源监控完成: 内存 ${this.metrics.memoryUsage.toFixed(2)}MB, CPU ~${this.metrics.cpuUsage.toFixed(1)}%`)
  }

  /**
   * 运行完整的性能基准测试套件
   */
  async runFullBenchmark(): Promise<{ 
    metrics: PerformanceMetrics, 
    results: Array<{ name: string, passed: boolean, detail: string }> 
  }> {
    console.log('
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 201
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 281 行发现可疑模式: '
      console.log(`${status} ${target.name}: ${detail}`)
      
      return {
        name: target.name,
        passed,
        detail
      }
    })
    
    const passedCount = results.filter(r => r.passed).length
    const totalCount = results.length
    
    console.log(`\n📊 性能目标达成情况: ${passedCount}/${totalCount} (${(passedCount/totalCount*100).toFixed(1)}%)`)
    
    return results
  }

  /**
   * 模拟3D渲染工作负载
   */
  private simulate3DRenderWork(): void {
    // 模拟矩阵运算
    const matrix = Array.from({ length: 16 }, () => Math.random())
    for (let i = 0; i < 100; i++) {
      // 简单的矩阵变换运算
      const result = matrix.map((val, idx) => 
        val * Math.sin(idx) + Math.cos(idx * 0.1)
      )
    }
  }

  /**
   * 模拟GPS数据更新
   */
  private async simulateGPSUpdate(position: {
    lat: number, lng: number, alt: number, speed: number, course: number
  }): Promise<void> {
    // 模拟地图更新操作
    return new Promise(resolve => {
      // 模拟DOM操作和地图重绘
      const elements = Math.floor(Math.random() * 50) + 10
      for (let i = 0; i < elements; i++) {
        const div = document.createElement('
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 281
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 324 行发现可疑模式: ')
        div.style.transform = `translate(${position.lat}, ${position.lng})`
        document.body.appendChild(div)
        document.body.removeChild(div)
      }
      resolve()
    })
  }

  /**
   * 模拟FFT计算
   */
  private async simulateFFTCalculation(data: number[]): Promise<number[]> {
    // 简化的FFT模拟（实际应该使用真正的FFT库）
    return new Promise(resolve => {
      const result = new Array(data.length / 2)
      
      for (let k = 0; k < result.length; k++) {
        let real = 0, imag = 0
        for (let n = 0; n < Math.min(data.length, 64); n++) { // 限制计算量
          const angle = -2 * Math.PI * k * n / data.length
          real += data[n] * Math.cos(angle)
          imag += data[n] * Math.sin(angle)
        }
        result[k] = Math.sqrt(real * real + imag * imag)
      }
      
      resolve(result)
    })
  }

  /**
   * 模拟多图表更新
   */
  private async simulateMultiPlotUpdate(updateData: Array<{
    seriesId: string,
    points: Array<{ x: number, y: number }>
  }>): Promise<void> {
    return new Promise(resolve => {
      // 模拟图表数据处理和DOM更新
      updateData.forEach(series => {
        series.points.forEach(point => {
          // 模拟数据点处理
          const processed = {
            x: point.x * 1.001,
            y: point.y * 0.999 + Math.random() * 0.001
          }
        })
      })
      
      // 模拟Canvas重绘
      setTimeout(resolve, Math.random() * 5)
    })
  }

  /**
   * 生成性能报告
   */
  generateReport(): string {
    const report = [
      '
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 324
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 228 行发现可疑模式: ${suite.name}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 228
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 233 行发现可疑模式: ${test.name}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 233
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 234 行发现可疑模式: ${test.description}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 234
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 246 行发现可疑模式: ${result.duration.toFixed(2)}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 246
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 248 行发现可疑模式: ${result.detail}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 248
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 251 行发现可疑模式: ${result.duration.toFixed(2)}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 251
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 253 行发现可疑模式: ${result.error}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 253
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 266 行发现可疑模式: ${duration.toFixed(2)}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 266
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 267 行发现可疑模式: ${errorMessage}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 267
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 278 行发现可疑模式: ${totalDuration.toFixed(2)}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 278
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 279 行发现可疑模式: ${passedTests}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 279
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 279 行发现可疑模式: ${totalTests}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 279
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 279 行发现可疑模式: ${(passedTests/totalTests*100).toFixed(1)}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 279
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 300 行发现可疑模式: ${testData.leafletLoaded}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 300
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 300 行发现可疑模式: ${testData.mapContainer}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 300
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 323 行发现可疑模式: ${updateCount}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 323
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 335 行发现可疑模式: ${drawnPoints}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 335
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 335 行发现可疑模式: ${trajectoryPoints}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 335
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 352 行发现可疑模式: ${switchCount}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 352
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 352 行发现可疑模式: ${layers.length}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 352
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 374 行发现可疑模式: ${avgResponseTime.toFixed(2)}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 374
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 374 行发现可疑模式: ${maxResponseTime.toFixed(2)}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 374
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 395 行发现可疑模式: ${components.webGL}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 395
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 395 行发现可疑模式: ${components.threeJS}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 395
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 407 行发现可疑模式: ${renderedPoints}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 407
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 407 行发现可疑模式: ${testPoints}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 407
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 424 行发现可疑模式: ${workingControls}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 424
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 424 行发现可疑模式: ${controls.length}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 424
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 436 行发现可疑模式: ${supportedModes}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 436
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 436 行发现可疑模式: ${stereoModes.length}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 436
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 460 行发现可疑模式: ${fps.toFixed(2)}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 460
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 499 行发现可疑模式: ${peakFreq.toFixed(1)}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 499
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 511 行发现可疑模式: ${workingWindows}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 511
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 511 行发现可疑模式: ${windowFunctions.length}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 511
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 528 行发现可疑模式: ${successCount}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 528
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 528 行发现可疑模式: ${analysisCount}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 528
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 551 行发现可疑模式: ${samplesPerSecond.toFixed(0)}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 551
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 578 行发现可疑模式: ${renderedSeries}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 578
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 578 行发现可疑模式: ${seriesCount}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 578
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 590 行发现可疑模式: ${workingOperations}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 590
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 590 行发现可疑模式: ${legendOperations.length}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 590
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 602 行发现可疑模式: ${supportedModes}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 602
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 602 行发现可疑模式: ${interpolationModes.length}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 602
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 624 行发现可疑模式: ${updateRate.toFixed(2)}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 624
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 640 行发现可疑模式: ${compatibleTypes}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 640
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 640 行发现可疑模式: ${dataTypes.length}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 640
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 650 行发现可疑模式: ${i}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 650
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 657 行发现可疑模式: ${results.length}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 657
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 657 行发现可疑模式: ${componentCount}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 657
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 688 行发现可疑模式: ${(memoryGrowth / 1024 / 1024).toFixed(2)}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 688
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 722 行发现可疑模式: ${passedCount}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 722
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 722 行发现可疑模式: ${totalCount}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 722
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 729 行发现可疑模式: ${error instanceof Error ? error.message : String(error)}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 729
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 756 行发现可疑模式: ${category}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 756
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 756 行发现可疑模式: ${stats.passed}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 756
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 756 行发现可疑模式: ${stats.total}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 756
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 756 行发现可疑模式: ${percentage}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 756
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 767 行发现可疑模式: ${perf.name}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 767
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 770 行发现可疑模式: ${key}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 770
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 770 行发现可疑模式: ${value.toFixed(2)}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 770
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 783 行发现可疑模式: ${name}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 783
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 783 行发现可疑模式: ${result.error || '未知错误'}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 783
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 788 行发现可疑模式: ${passedTests}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 788
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 788 行发现可疑模式: ${totalTests}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 788
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 788 行发现可疑模式: ${(passedTests/totalTests*100).toFixed(1)}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 788
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 789 行发现可疑模式: ${new Date().toLocaleString()}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 789
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 790 行发现可疑模式: ${totalDuration.toFixed(2)}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 790
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 795 行发现可疑模式: ${totalTests - passedTests}
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 795
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 229 行发现可疑模式: ' .repeat(40))
      
      for (const test of suite.tests) {
        totalTests++
        console.log(`\n🧪 ${test.name}`)
        console.log(`   📝 ${test.description}`)
        
        const testStart = performance.now()
        
        try {
          const result = await test.execute()
          result.duration = performance.now() - testStart
          
          this.testResults.set(test.name, result)
          
          if (result.passed) {
            passedTests++
            console.log(`   ✅ 通过 (${result.duration.toFixed(2)}ms)`)
            if (result.detail) {
              console.log(`   💡 ${result.detail}`)
            }
          } else {
            console.log(`   ❌ 失败 (${result.duration.toFixed(2)}ms)`)
            if (result.error) {
              console.log(`   ⚠️  ${result.error}`)
            }
          }
          
        } catch (error) {
          const duration = performance.now() - testStart
          const errorMessage = error instanceof Error ? error.message : String(error)
          this.testResults.set(test.name, {
            passed: false,
            error: errorMessage,
            duration
          })
          
          console.log(`   💥 异常 (${duration.toFixed(2)}ms)`)
          console.log(`   ⚠️  ${errorMessage}`)
        }
        
        // 测试间短暂延迟，避免资源竞争
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    const totalDuration = (performance.now() - this.startTime) / 1000
    
    console.log('
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 229
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 277 行发现可疑模式: ' + '
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 277
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 301 行发现可疑模式: ',
      duration: 0
    }
  }

  private async testGPSPositionUpdate(): Promise<TestResult> {
    // 模拟位置更新测试
    const positions = [
      { lat: 39.9042, lng: 116.4074 },
      { lat: 39.9142, lng: 116.4174 },
      { lat: 39.9242, lng: 116.4274 }
    ]
    
    let updateCount = 0
    for (const pos of positions) {
      // 模拟位置更新
      await new Promise(resolve => setTimeout(resolve, 10))
      updateCount++
    }
    
    return {
      passed: updateCount === positions.length,
      detail: `成功更新${updateCount}个位置点`,
      duration: 0
    }
  }

  private async testGPSTrajectory(): Promise<TestResult> {
    // 模拟轨迹绘制测试
    const trajectoryPoints = 5
    const drawnPoints = trajectoryPoints // 模拟成功绘制
    
    return {
      passed: drawnPoints === trajectoryPoints,
      detail: `轨迹点绘制: ${drawnPoints}/${trajectoryPoints}`,
      duration: 0
    }
  }

  private async testGPSLayers(): Promise<TestResult> {
    // 模拟图层切换测试
    const layers = ['
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 301
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 342 行发现可疑模式: ']
    let switchCount = 0
    
    for (const layer of layers) {
      await new Promise(resolve => setTimeout(resolve, 50))
      switchCount++
    }
    
    return {
      passed: switchCount === layers.length,
      detail: `图层切换成功: ${switchCount}/${layers.length}`,
      duration: 0
    }
  }

  private async testGPSPerformance(): Promise<TestResult> {
    // 模拟GPS性能测试
    const testCount = 20
    const responseTimes: number[] = []
    
    for (let i = 0; i < testCount; i++) {
      const start = performance.now()
      // 模拟GPS更新操作
      await new Promise(resolve => setTimeout(resolve, Math.random() * 80 + 10))
      responseTimes.push(performance.now() - start)
    }
    
    const maxResponseTime = Math.max(...responseTimes)
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    
    return {
      passed: maxResponseTime <= 100,
      detail: `响应时间 - 平均: ${avgResponseTime.toFixed(2)}ms, 最大: ${maxResponseTime.toFixed(2)}ms`,
      metrics: { maxResponseTime, avgResponseTime },
      duration: 0
    }
  }

  /**
   * 3D组件测试实现
   */
  private async test3DInitialization(): Promise<TestResult> {
    // 模拟3D组件初始化
    const components = {
      webGL: typeof WebGLRenderingContext !== '
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 342
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 414 行发现可疑模式: ']
    let workingControls = 0
    
    for (const control of controls) {
      await new Promise(resolve => setTimeout(resolve, 30))
      workingControls++
    }
    
    return {
      passed: workingControls === controls.length,
      detail: `相机控制功能: ${workingControls}/${controls.length}`,
      duration: 0
    }
  }

  private async test3DStereoModes(): Promise<TestResult> {
    // 模拟立体显示测试
    const stereoModes = ['
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 414
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 431 行发现可疑模式: ']
    let supportedModes = stereoModes.length // 模拟全部支持
    
    return {
      passed: supportedModes === stereoModes.length,
      detail: `立体显示模式: ${supportedModes}/${stereoModes.length}`,
      duration: 0
    }
  }

  private async test3DPerformance(): Promise<TestResult> {
    // 模拟3D性能测试
    const frameCount = 60
    const testDuration = 1000 // 1秒
    
    let frames = 0
    const startTime = performance.now()
    
    while (performance.now() - startTime < testDuration) {
      // 模拟渲染操作
      frames++
      await new Promise(resolve => setTimeout(resolve, 15))
    }
    
    const actualDuration = (performance.now() - startTime) / 1000
    const fps = frames / actualDuration
    
    return {
      passed: fps >= 30,
      detail: `3D渲染帧率: ${fps.toFixed(2)} FPS`,
      metrics: { fps },
      duration: 0
    }
  }

  /**
   * FFT组件测试实现
   */
  private async testFFTInitialization(): Promise<TestResult> {
    // 模拟FFT初始化测试
    const fftReady = true // 模拟FFT引擎就绪
    
    return {
      passed: fftReady,
      detail: '
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 431
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 506 行发现可疑模式: ']
    let workingWindows = windowFunctions.length // 模拟全部工作
    
    return {
      passed: workingWindows === windowFunctions.length,
      detail: `窗函数支持: ${workingWindows}/${windowFunctions.length}`,
      duration: 0
    }
  }

  private async testFFTRealTimeAnalysis(): Promise<TestResult> {
    // 模拟实时FFT分析测试
    const analysisCount = 10
    let successCount = 0
    
    for (let i = 0; i < analysisCount; i++) {
      await new Promise(resolve => setTimeout(resolve, 20))
      successCount++
    }
    
    return {
      passed: successCount === analysisCount,
      detail: `实时分析成功率: ${successCount}/${analysisCount}`,
      duration: 0
    }
  }

  private async testFFTPerformance(): Promise<TestResult> {
    // 模拟FFT性能测试
    const sampleSize = 1024
    const testDuration = 1000 // 1秒
    let processedSamples = 0
    
    const startTime = performance.now()
    while (performance.now() - startTime < testDuration) {
      // 模拟FFT计算
      await new Promise(resolve => setTimeout(resolve, 5))
      processedSamples += sampleSize
    }
    
    const actualDuration = (performance.now() - startTime) / 1000
    const samplesPerSecond = processedSamples / actualDuration
    
    return {
      passed: samplesPerSecond >= 1000,
      detail: `FFT处理速度: ${samplesPerSecond.toFixed(0)} samples/s`,
      metrics: { samplesPerSecond },
      duration: 0
    }
  }

  /**
   * 多图表组件测试实现
   */
  private async testMultiPlotInitialization(): Promise<TestResult> {
    // 模拟多图表初始化
    const chartReady = true // 模拟图表就绪
    
    return {
      passed: chartReady,
      detail: '
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 506
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 597 行发现可疑模式: ']
    let supportedModes = interpolationModes.length
    
    return {
      passed: supportedModes === interpolationModes.length,
      detail: `插值模式支持: ${supportedModes}/${interpolationModes.length}`,
      duration: 0
    }
  }

  private async testMultiPlotPerformance(): Promise<TestResult> {
    // 模拟多图表性能测试
    const updateCount = 20
    const testDuration = 1000 // 1秒
    let updates = 0
    
    const startTime = performance.now()
    while (performance.now() - startTime < testDuration && updates < updateCount) {
      await new Promise(resolve => setTimeout(resolve, 40))
      updates++
    }
    
    const actualDuration = (performance.now() - startTime) / 1000
    const updateRate = updates / actualDuration
    
    return {
      passed: updateRate >= 10,
      detail: `图表更新频率: ${updateRate.toFixed(2)} Hz`,
      metrics: { updateRate },
      duration: 0
    }
  }

  /**
   * 集成测试实现
   */
  private async testDataTypeCompatibility(): Promise<TestResult> {
    // 模拟数据类型兼容性测试
    const dataTypes = ['
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 597
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 635 行发现可疑模式: ']
    let compatibleTypes = dataTypes.length
    
    return {
      passed: compatibleTypes === dataTypes.length,
      detail: `数据类型兼容: ${compatibleTypes}/${dataTypes.length}`,
      duration: 0
    }
  }

  private async testConcurrentRendering(): Promise<TestResult> {
    // 模拟并发渲染测试
    const componentCount = 4
    const renderPromises = Array.from({length: componentCount}, async (_, i) => {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50))
      return `Component-${i}`
    })
    
    const results = await Promise.all(renderPromises)
    
    return {
      passed: results.length === componentCount,
      detail: `并发渲染组件: ${results.length}/${componentCount}`,
      duration: 0
    }
  }

  private async testMemoryLeaks(): Promise<TestResult> {
    // 模拟内存泄漏测试
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0
    
    // 模拟内存密集操作
    const tempArrays = []
    for (let i = 0; i < 100; i++) {
      tempArrays.push(new Array(1000).fill(Math.random()))
    }
    
    // 清理
    tempArrays.length = 0
    
    // 强制垃圾回收（如果可用）
    if (typeof window !== '
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 635
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 746 行发现可疑模式: ')[0]
      const stats = categoryStats.get(category) || { passed: 0, total: 0 }
      stats.total++
      if (result.passed) stats.passed++
      categoryStats.set(category, stats)
    }
    
    console.log('
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 746
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 787 行发现可疑模式: ' + '
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 787
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/utils/MessageBridge.ts 第 90 行发现可疑模式: ${type}
- **文件**: webview/utils/MessageBridge.ts
- **行号**: 90
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/utils/MessageBridge.ts 第 106 行发现可疑模式: ${++this.messageId}
- **文件**: webview/utils/MessageBridge.ts
- **行号**: 106
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/utils/MessageBridge.ts 第 106 行发现可疑模式: ${Date.now()}
- **文件**: webview/utils/MessageBridge.ts
- **行号**: 106
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/utils/MessageBridge.ts 第 72 行发现可疑模式: ', error);
    }
  }

  /**
   * 发送请求并等待响应
   * @param type 消息类型
   * @param payload 消息载荷
   * @param timeout 超时时间（毫秒）
   * @returns Promise响应
   */
  sendRequest<T = any>(type: MessageType, payload?: any, timeout = 5000): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = this.generateMessageId();
      
      // 设置超时
      const timeoutHandle = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`请求超时: ${type}`));
      }, timeout);

      // 存储待处理的请求
      this.pendingRequests.set(id, { resolve, reject, timeout: timeoutHandle });

      // 发送消息
      this.sendMessage({ type, payload, id });
    });
  }

  /**
   * 生成唯一的消息ID
   * @returns 消息ID
   */
  private generateMessageId(): string {
    return `msg_${++this.messageId}_${Date.now()}`;
  }

  // === 连接管理相关方法 ===

  /**
   * 连接设备
   * @param config 连接配置
   */
  async connectDevice(config: any): Promise<void> {
    await this.sendRequest(MessageType.CONNECT_DEVICE, config);
  }

  /**
   * 断开设备连接
   */
  async disconnectDevice(): Promise<void> {
    await this.sendRequest(MessageType.DISCONNECT_DEVICE);
  }

  /**
   * 获取连接状态
   */
  async getConnectionStatus(): Promise<any> {
    return await this.sendRequest(MessageType.CONNECTION_STATUS);
  }

  // === 项目管理相关方法 ===

  /**
   * 加载项目
   * @param projectPath 项目路径
   */
  async loadProject(projectPath: string): Promise<any> {
    return await this.sendRequest(MessageType.LOAD_PROJECT, { projectPath });
  }

  /**
   * 保存项目
   * @param projectConfig 项目配置
   * @param projectPath 保存路径
   */
  async saveProject(projectConfig: any, projectPath?: string): Promise<void> {
    await this.sendRequest(MessageType.SAVE_PROJECT, { projectConfig, projectPath });
  }

  // === 配置管理相关方法 ===

  /**
   * 更新配置
   * @param config 新配置
   */
  async updateConfig(config: any): Promise<void> {
    await this.sendRequest(MessageType.UPDATE_CONFIG, config);
  }

  /**
   * 获取配置
   */
  async getConfig(): Promise<any> {
    return await this.sendRequest(MessageType.GET_CONFIG);
  }

  // === 数据导出相关方法 ===

  /**
   * 导出数据
   * @param exportConfig 导出配置
   */
  async exportData(exportConfig: any): Promise<any> {
    return await this.sendRequest(MessageType.EXPORT_DATA, exportConfig);
  }

  // === 便捷方法 ===

  /**
   * 监听数据帧
   * @param callback 回调函数
   */
  onFrameData(callback: (data: any) => void): void {
    this.on(MessageType.FRAME_DATA, callback);
  }

  /**
   * 监听原始数据
   * @param callback 回调函数
   */
  onRawData(callback: (data: any) => void): void {
    this.on(MessageType.RAW_DATA, callback);
  }

  /**
   * 监听连接状态变化
   * @param callback 回调函数
   */
  onConnectionStatus(callback: (status: any) => void): void {
    this.on(MessageType.CONNECTION_STATUS, callback);
  }

  /**
   * 监听项目加载完成
   * @param callback 回调函数
   */
  onProjectLoaded(callback: (project: any) => void): void {
    this.on(MessageType.PROJECT_LOADED, callback);
  }

  /**
   * 监听导出完成
   * @param callback 回调函数
   */
  onExportComplete(callback: (result: any) => void): void {
    this.on(MessageType.EXPORT_COMPLETE, callback);
  }

  /**
   * 监听错误
   * @param callback 回调函数
   */
  onError(callback: (error: any) => void): void {
    this.on(MessageType.ERROR, callback);
  }

  /**
   * 监听警告
   * @param callback 回调函数
   */
  onWarning(callback: (warning: any) => void): void {
    this.on(MessageType.WARNING, callback);
  }

  /**
   * 监听信息
   * @param callback 回调函数
   */
  onInfo(callback: (info: any) => void): void {
    this.on(MessageType.INFO, callback);
  }

  // === 日志和调试方法 ===

  /**
   * 发送日志消息
   * @param level 日志级别
   * @param message 消息内容
   * @param data 附加数据
   */
  log(level: '
- **文件**: webview/utils/MessageBridge.ts
- **行号**: 72
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/utils/ThemeManager.ts 第 157 行发现可疑模式: ${themeId}
- **文件**: webview/utils/ThemeManager.ts
- **行号**: 157
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/utils/ThemeManager.ts 第 169 行发现可疑模式: ${themeTitle}
- **文件**: webview/utils/ThemeManager.ts
- **行号**: 169
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/utils/ThemeManager.ts 第 185 行发现可疑模式: ${theme.title}
- **文件**: webview/utils/ThemeManager.ts
- **行号**: 185
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/utils/ThemeManager.ts 第 204 行发现可疑模式: ${validation.errors.join(', ')}
- **文件**: webview/utils/ThemeManager.ts
- **行号**: 204
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/utils/ThemeManager.ts 第 245 行发现可疑模式: ${themeTitle}
- **文件**: webview/utils/ThemeManager.ts
- **行号**: 245
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/utils/ThemeManager.ts 第 259 行发现可疑模式: ${error instanceof Error ? error.message : String(error)}
- **文件**: webview/utils/ThemeManager.ts
- **行号**: 259
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/utils/ThemeManager.ts 第 384 行发现可疑模式: ${key.replace(/_/g, '-')}
- **文件**: webview/utils/ThemeManager.ts
- **行号**: 384
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/utils/ThemeManager.ts 第 389 行发现可疑模式: ${key.replace(/_/g, '-')}
- **文件**: webview/utils/ThemeManager.ts
- **行号**: 389
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/utils/ThemeManager.ts 第 399 行发现可疑模式: ${index}
- **文件**: webview/utils/ThemeManager.ts
- **行号**: 399
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/utils/ThemeManager.ts 第 407 行发现可疑模式: ${effectiveType}
- **文件**: webview/utils/ThemeManager.ts
- **行号**: 407
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/utils/ThemeManager.ts 第 577 行发现可疑模式: ${color}
- **文件**: webview/utils/ThemeManager.ts
- **行号**: 577
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/utils/ThemeManager.ts 第 505 行发现可疑模式: ';
    const rgb = this.hexToRgb(bgColor);
    if (rgb) {
      const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
      return brightness > 128 ? '
- **文件**: webview/utils/ThemeManager.ts
- **行号**: 505
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🔴 潜在的Command Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 webview/utils/ThemeManager.ts 第 518 行发现可疑模式: exec(
- **文件**: webview/utils/ThemeManager.ts
- **行号**: 518
- **CWE ID**: CWE-78
- **建议**: 避免执行外部命令，使用安全的API替代

### 🔴 潜在的SQL Injection风险

- **级别**: CRITICAL
- **类别**: Code Security
- **描述**: 在文件 workers/DataProcessor.ts 第 49 行发现可疑模式: '
    };
  }

  /**
   * 配置数据处理器参数
   */
  configure(config: Partial<DataProcessorConfig>): void {
    this.config = { ...this.config, ...config };
    
    // 重新配置缓冲区大小
    if (config.bufferSize && config.bufferSize !== this.buffer.capacity) {
      this.buffer = new CircularBuffer(config.bufferSize);
    }
    
    // 配置帧读取器
    this.frameReader.setFrameDetectionMode(this.config.frameDetectionMode);
    if (this.config.startSequence) {
      this.frameReader.setStartSequence(new Uint8Array(this.config.startSequence));
    }
    if (this.config.endSequence) {
      this.frameReader.setFinishSequence(new Uint8Array(this.config.endSequence));
    }
    if (this.config.checksumAlgorithm) {
      this.frameReader.setChecksum(this.config.checksumAlgorithm);
    }
    this.frameReader.setOperationMode(this.config.operationMode);
  }

  /**
   * 处理原始数据帧
   * 模拟Serial-Studio的processData逻辑
   */
  processFrame(rawData: ArrayBuffer): ProcessedFrame[] {
    const results: ProcessedFrame[] = [];
    
    try {
      // 将数据追加到环形缓冲区
      this.buffer.append(new Uint8Array(rawData));
      
      // 使用FrameReader提取完整帧
      const frames = this.frameReader.extractFrames(this.buffer);
      
      // 处理每个提取的帧
      for (const frameData of frames) {
        const parsedData = this.parser.parse(frameData);
        
        if (parsedData) {
          results.push({
            datasets: parsedData,
            timestamp: performance.now(),
            sequence: ++this.sequenceCounter,
            validationStatus: '
- **文件**: workers/DataProcessor.ts
- **行号**: 49
- **CWE ID**: CWE-89
- **建议**: 使用参数化查询和ORM，避免字符串拼接

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/CSVExporter.ts 第 7 行发现可疑模式: ../
- **文件**: extension/export/exporters/CSVExporter.ts
- **行号**: 7
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/ExcelExporter.ts 第 8 行发现可疑模式: ../
- **文件**: extension/export/exporters/ExcelExporter.ts
- **行号**: 8
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/JSONExporter.ts 第 7 行发现可疑模式: ../
- **文件**: extension/export/exporters/JSONExporter.ts
- **行号**: 7
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 extension/export/exporters/XMLExporter.ts 第 7 行发现可疑模式: ../
- **文件**: extension/export/exporters/XMLExporter.ts
- **行号**: 7
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/BluetoothLEDriver.ts 第 8 行发现可疑模式: ../
- **文件**: extension/io/drivers/BluetoothLEDriver.ts
- **行号**: 8
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/NetworkDriver.ts 第 9 行发现可疑模式: ../
- **文件**: extension/io/drivers/NetworkDriver.ts
- **行号**: 9
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/UARTDriver.ts 第 7 行发现可疑模式: ../
- **文件**: extension/io/drivers/UARTDriver.ts
- **行号**: 7
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 extension/parsing/DataDecoder.ts 第 6 行发现可疑模式: ../
- **文件**: extension/parsing/DataDecoder.ts
- **行号**: 6
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 extension/parsing/DataDecoder.ts 第 6 行发现可疑模式: ../
- **文件**: extension/parsing/DataDecoder.ts
- **行号**: 6
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 extension/parsing/FrameReader.ts 第 14 行发现可疑模式: ../
- **文件**: extension/parsing/FrameReader.ts
- **行号**: 14
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 extension/parsing/FrameReader.ts 第 14 行发现可疑模式: ../
- **文件**: extension/parsing/FrameReader.ts
- **行号**: 14
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginContext.ts 第 21 行发现可疑模式: ../
- **文件**: extension/plugins/PluginContext.ts
- **行号**: 21
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginContext.ts 第 22 行发现可疑模式: ../
- **文件**: extension/plugins/PluginContext.ts
- **行号**: 22
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/PluginContext.ts 第 23 行发现可疑模式: ../
- **文件**: extension/plugins/PluginContext.ts
- **行号**: 23
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/types.ts 第 10 行发现可疑模式: ../
- **文件**: extension/plugins/types.ts
- **行号**: 10
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/types.ts 第 11 行发现可疑模式: ../
- **文件**: extension/plugins/types.ts
- **行号**: 11
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 extension/plugins/types.ts 第 12 行发现可疑模式: ../
- **文件**: extension/plugins/types.ts
- **行号**: 12
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 extension/project/ProjectManager.ts 第 15 行发现可疑模式: ../
- **文件**: extension/project/ProjectManager.ts
- **行号**: 15
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 extension/project/ProjectSerializer.ts 第 9 行发现可疑模式: ../
- **文件**: extension/project/ProjectSerializer.ts
- **行号**: 9
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 extension/project/ProjectValidator.ts 第 11 行发现可疑模式: ../
- **文件**: extension/project/ProjectValidator.ts
- **行号**: 11
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 12 行发现可疑模式: ../
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 12
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 13 行发现可疑模式: ../
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 13
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 14 行发现可疑模式: ../
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 14
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 15 行发现可疑模式: ../
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 15
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 shared/PerformanceMonitor.ts 第 421 行发现可疑模式: ../
- **文件**: shared/PerformanceMonitor.ts
- **行号**: 421
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportIntegration.test.ts 第 22 行发现可疑模式: ../
- **文件**: tests/export/ExportIntegration.test.ts
- **行号**: 22
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportIntegration.test.ts 第 22 行发现可疑模式: ../
- **文件**: tests/export/ExportIntegration.test.ts
- **行号**: 22
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportQualityMetrics.test.ts 第 23 行发现可疑模式: ../
- **文件**: tests/export/ExportQualityMetrics.test.ts
- **行号**: 23
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportQualityMetrics.test.ts 第 23 行发现可疑模式: ../
- **文件**: tests/export/ExportQualityMetrics.test.ts
- **行号**: 23
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/integration/Implementation.test.ts 第 11 行发现可疑模式: ../
- **文件**: tests/integration/Implementation.test.ts
- **行号**: 11
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 27 行发现可疑模式: ../
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 27
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 27 行发现可疑模式: ../
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 27
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 28 行发现可疑模式: ../
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 28
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 28 行发现可疑模式: ../
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 28
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 91 行发现可疑模式: ../
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 91
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 91 行发现可疑模式: ../
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 91
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 92 行发现可疑模式: ../
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 92
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 92 行发现可疑模式: ../
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 92
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 154 行发现可疑模式: ../
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 154
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 154 行发现可疑模式: ../
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 154
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 155 行发现可疑模式: ../
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 155
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 155 行发现可疑模式: ../
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 155
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 261 行发现可疑模式: ../
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 261
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 261 行发现可疑模式: ../
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 261
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 262 行发现可疑模式: ../
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 262
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 262 行发现可疑模式: ../
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 262
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/integration/ThemeI18nIntegration.test.ts 第 7 行发现可疑模式: ../
- **文件**: tests/integration/ThemeI18nIntegration.test.ts
- **行号**: 7
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/integration/ThemeI18nIntegration.test.ts 第 7 行发现可疑模式: ../
- **文件**: tests/integration/ThemeI18nIntegration.test.ts
- **行号**: 7
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/integration/ThemeI18nIntegration.test.ts 第 8 行发现可疑模式: ../
- **文件**: tests/integration/ThemeI18nIntegration.test.ts
- **行号**: 8
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/integration/ThemeI18nIntegration.test.ts 第 8 行发现可疑模式: ../
- **文件**: tests/integration/ThemeI18nIntegration.test.ts
- **行号**: 8
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/integration/ThemeI18nIntegration.test.ts 第 9 行发现可疑模式: ../
- **文件**: tests/integration/ThemeI18nIntegration.test.ts
- **行号**: 9
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/integration/ThemeI18nIntegration.test.ts 第 9 行发现可疑模式: ../
- **文件**: tests/integration/ThemeI18nIntegration.test.ts
- **行号**: 9
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/integration/ThemeI18nIntegration.test.ts 第 10 行发现可疑模式: ../
- **文件**: tests/integration/ThemeI18nIntegration.test.ts
- **行号**: 10
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/integration/ThemeI18nIntegration.test.ts 第 10 行发现可疑模式: ../
- **文件**: tests/integration/ThemeI18nIntegration.test.ts
- **行号**: 10
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/integration/ThemeI18nIntegration.test.ts 第 11 行发现可疑模式: ../
- **文件**: tests/integration/ThemeI18nIntegration.test.ts
- **行号**: 11
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/integration/ThemeI18nIntegration.test.ts 第 11 行发现可疑模式: ../
- **文件**: tests/integration/ThemeI18nIntegration.test.ts
- **行号**: 11
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/io/BluetoothLEDriver.test.ts 第 7 行发现可疑模式: ../
- **文件**: tests/io/BluetoothLEDriver.test.ts
- **行号**: 7
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/io/BluetoothLEDriver.test.ts 第 7 行发现可疑模式: ../
- **文件**: tests/io/BluetoothLEDriver.test.ts
- **行号**: 7
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/io/DriverFactory.test.ts 第 7 行发现可疑模式: ../
- **文件**: tests/io/DriverFactory.test.ts
- **行号**: 7
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/io/DriverFactory.test.ts 第 7 行发现可疑模式: ../
- **文件**: tests/io/DriverFactory.test.ts
- **行号**: 7
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/io/DriverFactory.test.ts 第 8 行发现可疑模式: ../
- **文件**: tests/io/DriverFactory.test.ts
- **行号**: 8
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/io/DriverFactory.test.ts 第 8 行发现可疑模式: ../
- **文件**: tests/io/DriverFactory.test.ts
- **行号**: 8
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/io/HALDriver.test.ts 第 6 行发现可疑模式: ../
- **文件**: tests/io/HALDriver.test.ts
- **行号**: 6
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/io/HALDriver.test.ts 第 6 行发现可疑模式: ../
- **文件**: tests/io/HALDriver.test.ts
- **行号**: 6
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/io/HALDriver.test.ts 第 7 行发现可疑模式: ../
- **文件**: tests/io/HALDriver.test.ts
- **行号**: 7
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/io/HALDriver.test.ts 第 7 行发现可疑模式: ../
- **文件**: tests/io/HALDriver.test.ts
- **行号**: 7
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/io/Manager.test.ts 第 6 行发现可疑模式: ../
- **文件**: tests/io/Manager.test.ts
- **行号**: 6
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/io/Manager.test.ts 第 6 行发现可疑模式: ../
- **文件**: tests/io/Manager.test.ts
- **行号**: 6
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/io/Manager.test.ts 第 7 行发现可疑模式: ../
- **文件**: tests/io/Manager.test.ts
- **行号**: 7
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/io/Manager.test.ts 第 7 行发现可疑模式: ../
- **文件**: tests/io/Manager.test.ts
- **行号**: 7
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/io/Manager.test.ts 第 10 行发现可疑模式: ../
- **文件**: tests/io/Manager.test.ts
- **行号**: 10
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/io/Manager.test.ts 第 10 行发现可疑模式: ../
- **文件**: tests/io/Manager.test.ts
- **行号**: 10
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/io/NetworkDriver.test.ts 第 7 行发现可疑模式: ../
- **文件**: tests/io/NetworkDriver.test.ts
- **行号**: 7
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/io/NetworkDriver.test.ts 第 7 行发现可疑模式: ../
- **文件**: tests/io/NetworkDriver.test.ts
- **行号**: 7
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 31 行发现可疑模式: ../
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 31
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 31 行发现可疑模式: ../
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 31
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 79 行发现可疑模式: ../
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 79
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 79 行发现可疑模式: ../
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 79
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 118 行发现可疑模式: ../
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 118
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 118 行发现可疑模式: ../
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 118
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 180 行发现可疑模式: ../
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 180
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 180 行发现可疑模式: ../
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 180
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 224 行发现可疑模式: ../
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 224
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 224 行发现可疑模式: ../
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 224
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 7 行发现可疑模式: ../
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 7
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 7 行发现可疑模式: ../
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 7
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 8 行发现可疑模式: ../
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 8
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 8 行发现可疑模式: ../
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 8
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 9 行发现可疑模式: ../
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 9
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 9 行发现可疑模式: ../
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 9
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 10 行发现可疑模式: ../
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 10
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 10 行发现可疑模式: ../
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 10
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/plugins/ContributionRegistry.test.ts 第 8 行发现可疑模式: ../
- **文件**: tests/plugins/ContributionRegistry.test.ts
- **行号**: 8
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/plugins/ContributionRegistry.test.ts 第 8 行发现可疑模式: ../
- **文件**: tests/plugins/ContributionRegistry.test.ts
- **行号**: 8
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/plugins/ContributionRegistry.test.ts 第 9 行发现可疑模式: ../
- **文件**: tests/plugins/ContributionRegistry.test.ts
- **行号**: 9
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/plugins/ContributionRegistry.test.ts 第 9 行发现可疑模式: ../
- **文件**: tests/plugins/ContributionRegistry.test.ts
- **行号**: 9
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/plugins/PluginLoader.test.ts 第 8 行发现可疑模式: ../
- **文件**: tests/plugins/PluginLoader.test.ts
- **行号**: 8
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/plugins/PluginLoader.test.ts 第 8 行发现可疑模式: ../
- **文件**: tests/plugins/PluginLoader.test.ts
- **行号**: 8
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/plugins/PluginLoader.test.ts 第 9 行发现可疑模式: ../
- **文件**: tests/plugins/PluginLoader.test.ts
- **行号**: 9
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/plugins/PluginLoader.test.ts 第 9 行发现可疑模式: ../
- **文件**: tests/plugins/PluginLoader.test.ts
- **行号**: 9
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/plugins/PluginSystem.test.ts 第 22 行发现可疑模式: ../
- **文件**: tests/plugins/PluginSystem.test.ts
- **行号**: 22
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/plugins/PluginSystem.test.ts 第 22 行发现可疑模式: ../
- **文件**: tests/plugins/PluginSystem.test.ts
- **行号**: 22
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/plugins/PluginSystemCore.test.ts 第 18 行发现可疑模式: ../
- **文件**: tests/plugins/PluginSystemCore.test.ts
- **行号**: 18
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/plugins/PluginSystemCore.test.ts 第 18 行发现可疑模式: ../
- **文件**: tests/plugins/PluginSystemCore.test.ts
- **行号**: 18
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 14 行发现可疑模式: ../
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 14
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 14 行发现可疑模式: ../
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 14
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 15 行发现可疑模式: ../
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 15
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 15 行发现可疑模式: ../
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 15
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 16 行发现可疑模式: ../
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 16
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 16 行发现可疑模式: ../
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 16
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 17 行发现可疑模式: ../
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 17
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 17 行发现可疑模式: ../
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 17
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 25 行发现可疑模式: ../
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 25
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 25 行发现可疑模式: ../
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 25
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Sensitive Data Exposure风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 202 行发现可疑模式: ApiKey: 'test-maptiler-key'
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 202
- **CWE ID**: CWE-200
- **建议**: 使用环境变量或安全的密钥管理系统

### 🟡 潜在的Sensitive Data Exposure风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 203 行发现可疑模式: ApiKey: 'test-thunderforest-key'
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 203
- **CWE ID**: CWE-200
- **建议**: 使用环境变量或安全的密钥管理系统

### 🟡 潜在的Sensitive Data Exposure风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 861 行发现可疑模式: ApiKey: 'test-maptiler-key'
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 861
- **CWE ID**: CWE-200
- **建议**: 使用环境变量或安全的密钥管理系统

### 🟡 潜在的Sensitive Data Exposure风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 862 行发现可疑模式: ApiKey: 'test-thunderforest-key'
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 862
- **CWE ID**: CWE-200
- **建议**: 使用环境变量或安全的密钥管理系统

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/project/ProjectManager.test.ts 第 12 行发现可疑模式: ../
- **文件**: tests/project/ProjectManager.test.ts
- **行号**: 12
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/project/ProjectManager.test.ts 第 12 行发现可疑模式: ../
- **文件**: tests/project/ProjectManager.test.ts
- **行号**: 12
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/project/ProjectManager.test.ts 第 13 行发现可疑模式: ../
- **文件**: tests/project/ProjectManager.test.ts
- **行号**: 13
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/project/ProjectManager.test.ts 第 13 行发现可疑模式: ../
- **文件**: tests/project/ProjectManager.test.ts
- **行号**: 13
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/project/ProjectSerializer.test.ts 第 9 行发现可疑模式: ../
- **文件**: tests/project/ProjectSerializer.test.ts
- **行号**: 9
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/project/ProjectSerializer.test.ts 第 9 行发现可疑模式: ../
- **文件**: tests/project/ProjectSerializer.test.ts
- **行号**: 9
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/project/ProjectSerializer.test.ts 第 17 行发现可疑模式: ../
- **文件**: tests/project/ProjectSerializer.test.ts
- **行号**: 17
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/project/ProjectSerializer.test.ts 第 17 行发现可疑模式: ../
- **文件**: tests/project/ProjectSerializer.test.ts
- **行号**: 17
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Sensitive Data Exposure风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/project/ProjectSerializer.test.ts 第 65 行发现可疑模式: ApiKey: 'test-api-key'
- **文件**: tests/project/ProjectSerializer.test.ts
- **行号**: 65
- **CWE ID**: CWE-200
- **建议**: 使用环境变量或安全的密钥管理系统

### 🟡 潜在的Sensitive Data Exposure风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/project/ProjectSerializer.test.ts 第 66 行发现可疑模式: ApiKey: 'test-tf-key'
- **文件**: tests/project/ProjectSerializer.test.ts
- **行号**: 66
- **CWE ID**: CWE-200
- **建议**: 使用环境变量或安全的密钥管理系统

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/project/ProjectValidator.test.ts 第 9 行发现可疑模式: ../
- **文件**: tests/project/ProjectValidator.test.ts
- **行号**: 9
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/project/ProjectValidator.test.ts 第 9 行发现可疑模式: ../
- **文件**: tests/project/ProjectValidator.test.ts
- **行号**: 9
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/project/ProjectValidator.test.ts 第 20 行发现可疑模式: ../
- **文件**: tests/project/ProjectValidator.test.ts
- **行号**: 20
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/project/ProjectValidator.test.ts 第 20 行发现可疑模式: ../
- **文件**: tests/project/ProjectValidator.test.ts
- **行号**: 20
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Sensitive Data Exposure风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/project/ProjectValidator.test.ts 第 497 行发现可疑模式: ApiKey: 'your-api-key-here'
- **文件**: tests/project/ProjectValidator.test.ts
- **行号**: 497
- **CWE ID**: CWE-200
- **建议**: 使用环境变量或安全的密钥管理系统

### 🟡 潜在的Sensitive Data Exposure风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/project/ProjectValidator.test.ts 第 498 行发现可疑模式: ApiKey: 'your-api-key-here'
- **文件**: tests/project/ProjectValidator.test.ts
- **行号**: 498
- **CWE ID**: CWE-200
- **建议**: 使用环境变量或安全的密钥管理系统

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/quality/ThemeI18nQualityMetrics.test.ts 第 7 行发现可疑模式: ../
- **文件**: tests/quality/ThemeI18nQualityMetrics.test.ts
- **行号**: 7
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/quality/ThemeI18nQualityMetrics.test.ts 第 7 行发现可疑模式: ../
- **文件**: tests/quality/ThemeI18nQualityMetrics.test.ts
- **行号**: 7
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/quality/ThemeI18nQualityMetrics.test.ts 第 8 行发现可疑模式: ../
- **文件**: tests/quality/ThemeI18nQualityMetrics.test.ts
- **行号**: 8
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/quality/ThemeI18nQualityMetrics.test.ts 第 8 行发现可疑模式: ../
- **文件**: tests/quality/ThemeI18nQualityMetrics.test.ts
- **行号**: 8
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/quality/ThemeI18nQualityMetrics.test.ts 第 9 行发现可疑模式: ../
- **文件**: tests/quality/ThemeI18nQualityMetrics.test.ts
- **行号**: 9
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/quality/ThemeI18nQualityMetrics.test.ts 第 9 行发现可疑模式: ../
- **文件**: tests/quality/ThemeI18nQualityMetrics.test.ts
- **行号**: 9
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/quality/ThemeI18nQualityMetrics.test.ts 第 10 行发现可疑模式: ../
- **文件**: tests/quality/ThemeI18nQualityMetrics.test.ts
- **行号**: 10
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/quality/ThemeI18nQualityMetrics.test.ts 第 10 行发现可疑模式: ../
- **文件**: tests/quality/ThemeI18nQualityMetrics.test.ts
- **行号**: 10
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/quality/ThemeI18nQualityMetrics.test.ts 第 11 行发现可疑模式: ../
- **文件**: tests/quality/ThemeI18nQualityMetrics.test.ts
- **行号**: 11
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 tests/quality/ThemeI18nQualityMetrics.test.ts 第 11 行发现可疑模式: ../
- **文件**: tests/quality/ThemeI18nQualityMetrics.test.ts
- **行号**: 11
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/ProjectEditor.vue 第 190 行发现可疑模式: ../
- **文件**: webview/components/ProjectEditor.vue
- **行号**: 190
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/ProjectEditor.vue 第 191 行发现可疑模式: ../
- **文件**: webview/components/ProjectEditor.vue
- **行号**: 191
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/ProjectEditor.vue 第 191 行发现可疑模式: ../
- **文件**: webview/components/ProjectEditor.vue
- **行号**: 191
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/base/BaseWidget.vue 第 203 行发现可疑模式: ../
- **文件**: webview/components/base/BaseWidget.vue
- **行号**: 203
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/base/BaseWidget.vue 第 203 行发现可疑模式: ../
- **文件**: webview/components/base/BaseWidget.vue
- **行号**: 203
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/base/BaseWidget.vue 第 203 行发现可疑模式: ../
- **文件**: webview/components/base/BaseWidget.vue
- **行号**: 203
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/base/BaseWidget.vue 第 204 行发现可疑模式: ../
- **文件**: webview/components/base/BaseWidget.vue
- **行号**: 204
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/base/BaseWidget.vue 第 205 行发现可疑模式: ../
- **文件**: webview/components/base/BaseWidget.vue
- **行号**: 205
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/WidgetExportDialog.vue 第 249 行发现可疑模式: ../
- **文件**: webview/components/dialogs/WidgetExportDialog.vue
- **行号**: 249
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/WidgetExportDialog.vue 第 249 行发现可疑模式: ../
- **文件**: webview/components/dialogs/WidgetExportDialog.vue
- **行号**: 249
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/WidgetExportDialog.vue 第 249 行发现可疑模式: ../
- **文件**: webview/components/dialogs/WidgetExportDialog.vue
- **行号**: 249
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/WidgetSettingsDialog.vue 第 266 行发现可疑模式: ../
- **文件**: webview/components/dialogs/WidgetSettingsDialog.vue
- **行号**: 266
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/WidgetSettingsDialog.vue 第 266 行发现可疑模式: ../
- **文件**: webview/components/dialogs/WidgetSettingsDialog.vue
- **行号**: 266
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/WidgetSettingsDialog.vue 第 266 行发现可疑模式: ../
- **文件**: webview/components/dialogs/WidgetSettingsDialog.vue
- **行号**: 266
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/test/GPSWidgetTest.vue 第 95 行发现可疑模式: ../
- **文件**: webview/components/test/GPSWidgetTest.vue
- **行号**: 95
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/test/Plot3DWidgetTest.vue 第 149 行发现可疑模式: ../
- **文件**: webview/components/test/Plot3DWidgetTest.vue
- **行号**: 149
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/AccelerometerWidget.vue 第 271 行发现可疑模式: ../
- **文件**: webview/components/widgets/AccelerometerWidget.vue
- **行号**: 271
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/AccelerometerWidget.vue 第 272 行发现可疑模式: ../
- **文件**: webview/components/widgets/AccelerometerWidget.vue
- **行号**: 272
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/AccelerometerWidget.vue 第 272 行发现可疑模式: ../
- **文件**: webview/components/widgets/AccelerometerWidget.vue
- **行号**: 272
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/AccelerometerWidget.vue 第 272 行发现可疑模式: ../
- **文件**: webview/components/widgets/AccelerometerWidget.vue
- **行号**: 272
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/AccelerometerWidget.vue 第 273 行发现可疑模式: ../
- **文件**: webview/components/widgets/AccelerometerWidget.vue
- **行号**: 273
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/AccelerometerWidget.vue 第 273 行发现可疑模式: ../
- **文件**: webview/components/widgets/AccelerometerWidget.vue
- **行号**: 273
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/AccelerometerWidget.vue 第 274 行发现可疑模式: ../
- **文件**: webview/components/widgets/AccelerometerWidget.vue
- **行号**: 274
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/AccelerometerWidget.vue 第 274 行发现可疑模式: ../
- **文件**: webview/components/widgets/AccelerometerWidget.vue
- **行号**: 274
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/BarWidget.vue 第 139 行发现可疑模式: ../
- **文件**: webview/components/widgets/BarWidget.vue
- **行号**: 139
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/BarWidget.vue 第 140 行发现可疑模式: ../
- **文件**: webview/components/widgets/BarWidget.vue
- **行号**: 140
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/BarWidget.vue 第 140 行发现可疑模式: ../
- **文件**: webview/components/widgets/BarWidget.vue
- **行号**: 140
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/BarWidget.vue 第 140 行发现可疑模式: ../
- **文件**: webview/components/widgets/BarWidget.vue
- **行号**: 140
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/BarWidget.vue 第 141 行发现可疑模式: ../
- **文件**: webview/components/widgets/BarWidget.vue
- **行号**: 141
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/BarWidget.vue 第 141 行发现可疑模式: ../
- **文件**: webview/components/widgets/BarWidget.vue
- **行号**: 141
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/BarWidget.vue 第 142 行发现可疑模式: ../
- **文件**: webview/components/widgets/BarWidget.vue
- **行号**: 142
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/BarWidget.vue 第 142 行发现可疑模式: ../
- **文件**: webview/components/widgets/BarWidget.vue
- **行号**: 142
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/CompassWidget.vue 第 211 行发现可疑模式: ../
- **文件**: webview/components/widgets/CompassWidget.vue
- **行号**: 211
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/CompassWidget.vue 第 212 行发现可疑模式: ../
- **文件**: webview/components/widgets/CompassWidget.vue
- **行号**: 212
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/CompassWidget.vue 第 212 行发现可疑模式: ../
- **文件**: webview/components/widgets/CompassWidget.vue
- **行号**: 212
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/CompassWidget.vue 第 212 行发现可疑模式: ../
- **文件**: webview/components/widgets/CompassWidget.vue
- **行号**: 212
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/CompassWidget.vue 第 213 行发现可疑模式: ../
- **文件**: webview/components/widgets/CompassWidget.vue
- **行号**: 213
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/CompassWidget.vue 第 213 行发现可疑模式: ../
- **文件**: webview/components/widgets/CompassWidget.vue
- **行号**: 213
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/CompassWidget.vue 第 214 行发现可疑模式: ../
- **文件**: webview/components/widgets/CompassWidget.vue
- **行号**: 214
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/CompassWidget.vue 第 214 行发现可疑模式: ../
- **文件**: webview/components/widgets/CompassWidget.vue
- **行号**: 214
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/DataGridWidget.vue 第 260 行发现可疑模式: ../
- **文件**: webview/components/widgets/DataGridWidget.vue
- **行号**: 260
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/DataGridWidget.vue 第 261 行发现可疑模式: ../
- **文件**: webview/components/widgets/DataGridWidget.vue
- **行号**: 261
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/DataGridWidget.vue 第 261 行发现可疑模式: ../
- **文件**: webview/components/widgets/DataGridWidget.vue
- **行号**: 261
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/DataGridWidget.vue 第 261 行发现可疑模式: ../
- **文件**: webview/components/widgets/DataGridWidget.vue
- **行号**: 261
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/DataGridWidget.vue 第 262 行发现可疑模式: ../
- **文件**: webview/components/widgets/DataGridWidget.vue
- **行号**: 262
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/DataGridWidget.vue 第 262 行发现可疑模式: ../
- **文件**: webview/components/widgets/DataGridWidget.vue
- **行号**: 262
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/DataGridWidget.vue 第 263 行发现可疑模式: ../
- **文件**: webview/components/widgets/DataGridWidget.vue
- **行号**: 263
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/DataGridWidget.vue 第 263 行发现可疑模式: ../
- **文件**: webview/components/widgets/DataGridWidget.vue
- **行号**: 263
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/FFTPlotWidget.vue 第 166 行发现可疑模式: ../
- **文件**: webview/components/widgets/FFTPlotWidget.vue
- **行号**: 166
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GPSWidget.vue 第 124 行发现可疑模式: ../
- **文件**: webview/components/widgets/GPSWidget.vue
- **行号**: 124
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GaugeWidget.vue 第 236 行发现可疑模式: ../
- **文件**: webview/components/widgets/GaugeWidget.vue
- **行号**: 236
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GaugeWidget.vue 第 237 行发现可疑模式: ../
- **文件**: webview/components/widgets/GaugeWidget.vue
- **行号**: 237
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GaugeWidget.vue 第 237 行发现可疑模式: ../
- **文件**: webview/components/widgets/GaugeWidget.vue
- **行号**: 237
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GaugeWidget.vue 第 237 行发现可疑模式: ../
- **文件**: webview/components/widgets/GaugeWidget.vue
- **行号**: 237
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GaugeWidget.vue 第 238 行发现可疑模式: ../
- **文件**: webview/components/widgets/GaugeWidget.vue
- **行号**: 238
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GaugeWidget.vue 第 238 行发现可疑模式: ../
- **文件**: webview/components/widgets/GaugeWidget.vue
- **行号**: 238
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GyroscopeWidget.vue 第 326 行发现可疑模式: ../
- **文件**: webview/components/widgets/GyroscopeWidget.vue
- **行号**: 326
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GyroscopeWidget.vue 第 327 行发现可疑模式: ../
- **文件**: webview/components/widgets/GyroscopeWidget.vue
- **行号**: 327
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GyroscopeWidget.vue 第 327 行发现可疑模式: ../
- **文件**: webview/components/widgets/GyroscopeWidget.vue
- **行号**: 327
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GyroscopeWidget.vue 第 327 行发现可疑模式: ../
- **文件**: webview/components/widgets/GyroscopeWidget.vue
- **行号**: 327
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GyroscopeWidget.vue 第 328 行发现可疑模式: ../
- **文件**: webview/components/widgets/GyroscopeWidget.vue
- **行号**: 328
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GyroscopeWidget.vue 第 328 行发现可疑模式: ../
- **文件**: webview/components/widgets/GyroscopeWidget.vue
- **行号**: 328
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GyroscopeWidget.vue 第 329 行发现可疑模式: ../
- **文件**: webview/components/widgets/GyroscopeWidget.vue
- **行号**: 329
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GyroscopeWidget.vue 第 329 行发现可疑模式: ../
- **文件**: webview/components/widgets/GyroscopeWidget.vue
- **行号**: 329
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/LEDWidget.vue 第 209 行发现可疑模式: ../
- **文件**: webview/components/widgets/LEDWidget.vue
- **行号**: 209
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/LEDWidget.vue 第 210 行发现可疑模式: ../
- **文件**: webview/components/widgets/LEDWidget.vue
- **行号**: 210
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/LEDWidget.vue 第 210 行发现可疑模式: ../
- **文件**: webview/components/widgets/LEDWidget.vue
- **行号**: 210
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/LEDWidget.vue 第 210 行发现可疑模式: ../
- **文件**: webview/components/widgets/LEDWidget.vue
- **行号**: 210
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/LEDWidget.vue 第 211 行发现可疑模式: ../
- **文件**: webview/components/widgets/LEDWidget.vue
- **行号**: 211
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/LEDWidget.vue 第 211 行发现可疑模式: ../
- **文件**: webview/components/widgets/LEDWidget.vue
- **行号**: 211
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/LEDWidget.vue 第 212 行发现可疑模式: ../
- **文件**: webview/components/widgets/LEDWidget.vue
- **行号**: 212
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/LEDWidget.vue 第 212 行发现可疑模式: ../
- **文件**: webview/components/widgets/LEDWidget.vue
- **行号**: 212
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/MultiPlotWidget.vue 第 202 行发现可疑模式: ../
- **文件**: webview/components/widgets/MultiPlotWidget.vue
- **行号**: 202
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/Plot3DWidget.vue 第 169 行发现可疑模式: ../
- **文件**: webview/components/widgets/Plot3DWidget.vue
- **行号**: 169
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/PlotWidget.vue 第 128 行发现可疑模式: ../
- **文件**: webview/components/widgets/PlotWidget.vue
- **行号**: 128
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/PlotWidget.vue 第 129 行发现可疑模式: ../
- **文件**: webview/components/widgets/PlotWidget.vue
- **行号**: 129
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/PlotWidget.vue 第 129 行发现可疑模式: ../
- **文件**: webview/components/widgets/PlotWidget.vue
- **行号**: 129
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/PlotWidget.vue 第 129 行发现可疑模式: ../
- **文件**: webview/components/widgets/PlotWidget.vue
- **行号**: 129
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/PlotWidget.vue 第 130 行发现可疑模式: ../
- **文件**: webview/components/widgets/PlotWidget.vue
- **行号**: 130
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/PlotWidget.vue 第 130 行发现可疑模式: ../
- **文件**: webview/components/widgets/PlotWidget.vue
- **行号**: 130
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/PlotWidget.vue 第 131 行发现可疑模式: ../
- **文件**: webview/components/widgets/PlotWidget.vue
- **行号**: 131
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/PlotWidget.vue 第 131 行发现可疑模式: ../
- **文件**: webview/components/widgets/PlotWidget.vue
- **行号**: 131
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/TerminalWidget.vue 第 225 行发现可疑模式: ../
- **文件**: webview/components/widgets/TerminalWidget.vue
- **行号**: 225
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/TerminalWidget.vue 第 226 行发现可疑模式: ../
- **文件**: webview/components/widgets/TerminalWidget.vue
- **行号**: 226
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/TerminalWidget.vue 第 226 行发现可疑模式: ../
- **文件**: webview/components/widgets/TerminalWidget.vue
- **行号**: 226
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/TerminalWidget.vue 第 226 行发现可疑模式: ../
- **文件**: webview/components/widgets/TerminalWidget.vue
- **行号**: 226
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/TerminalWidget.vue 第 227 行发现可疑模式: ../
- **文件**: webview/components/widgets/TerminalWidget.vue
- **行号**: 227
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/TerminalWidget.vue 第 227 行发现可疑模式: ../
- **文件**: webview/components/widgets/TerminalWidget.vue
- **行号**: 227
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/TerminalWidget.vue 第 228 行发现可疑模式: ../
- **文件**: webview/components/widgets/TerminalWidget.vue
- **行号**: 228
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/TerminalWidget.vue 第 228 行发现可疑模式: ../
- **文件**: webview/components/widgets/TerminalWidget.vue
- **行号**: 228
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/composables/useI18n.ts 第 7 行发现可疑模式: ../
- **文件**: webview/composables/useI18n.ts
- **行号**: 7
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/composables/useI18n.ts 第 14 行发现可疑模式: ../
- **文件**: webview/composables/useI18n.ts
- **行号**: 14
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/i18n/I18nManager.ts 第 19 行发现可疑模式: ../
- **文件**: webview/i18n/I18nManager.ts
- **行号**: 19
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/i18n/I18nManager.ts 第 192 行发现可疑模式: ../
- **文件**: webview/i18n/I18nManager.ts
- **行号**: 192
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/i18n/I18nManager.ts 第 194 行发现可疑模式: ../
- **文件**: webview/i18n/I18nManager.ts
- **行号**: 194
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/i18n/I18nManager.ts 第 198 行发现可疑模式: ../
- **文件**: webview/i18n/I18nManager.ts
- **行号**: 198
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/i18n/languages.ts 第 6 行发现可疑模式: ../
- **文件**: webview/i18n/languages.ts
- **行号**: 6
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/main.ts 第 16 行发现可疑模式: ../
- **文件**: webview/main.ts
- **行号**: 16
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/stores/connection.ts 第 12 行发现可疑模式: ../
- **文件**: webview/stores/connection.ts
- **行号**: 12
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/stores/connection.ts 第 12 行发现可疑模式: ../
- **文件**: webview/stores/connection.ts
- **行号**: 12
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/stores/data.ts 第 14 行发现可疑模式: ../
- **文件**: webview/stores/data.ts
- **行号**: 14
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/stores/data.ts 第 14 行发现可疑模式: ../
- **文件**: webview/stores/data.ts
- **行号**: 14
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/stores/performance.ts 第 8 行发现可疑模式: ../
- **文件**: webview/stores/performance.ts
- **行号**: 8
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/stores/performance.ts 第 8 行发现可疑模式: ../
- **文件**: webview/stores/performance.ts
- **行号**: 8
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/stores/projectStore.ts 第 18 行发现可疑模式: ../
- **文件**: webview/stores/projectStore.ts
- **行号**: 18
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/stores/projectStore.ts 第 18 行发现可疑模式: ../
- **文件**: webview/stores/projectStore.ts
- **行号**: 18
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/themes/builtin-themes.ts 第 6 行发现可疑模式: ../
- **文件**: webview/themes/builtin-themes.ts
- **行号**: 6
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/translations/en_US.ts 第 6 行发现可疑模式: ../
- **文件**: webview/translations/en_US.ts
- **行号**: 6
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/translations/zh_CN.ts 第 6 行发现可疑模式: ../
- **文件**: webview/translations/zh_CN.ts
- **行号**: 6
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/utils/MessageBridge.ts 第 7 行发现可疑模式: ../
- **文件**: webview/utils/MessageBridge.ts
- **行号**: 7
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/utils/MessageBridge.ts 第 7 行发现可疑模式: ../
- **文件**: webview/utils/MessageBridge.ts
- **行号**: 7
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/utils/ThemeManager.ts 第 14 行发现可疑模式: ../
- **文件**: webview/utils/ThemeManager.ts
- **行号**: 14
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 webview/utils/ThemeManager.ts 第 15 行发现可疑模式: ../
- **文件**: webview/utils/ThemeManager.ts
- **行号**: 15
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 workers/DataProcessor.ts 第 7 行发现可疑模式: ../
- **文件**: workers/DataProcessor.ts
- **行号**: 7
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 workers/DataProcessor.ts 第 8 行发现可疑模式: ../
- **文件**: workers/DataProcessor.ts
- **行号**: 8
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟡 潜在的Path Traversal风险

- **级别**: HIGH
- **类别**: Code Security
- **描述**: 在文件 workers/DataProcessor.ts 第 9 行发现可疑模式: ../
- **文件**: workers/DataProcessor.ts
- **行号**: 9
- **CWE ID**: CWE-22
- **建议**: 使用安全的路径处理函数，验证文件路径

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 extension/export/BatchExportManager.ts 第 761 行发现可疑模式: Math.random()
- **文件**: extension/export/BatchExportManager.ts
- **行号**: 761
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 extension/export/BatchExportManager.ts 第 762 行发现可疑模式: Math.random()
- **文件**: extension/export/BatchExportManager.ts
- **行号**: 762
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 extension/export/BatchExportManager.ts 第 763 行发现可疑模式: Math.random()
- **文件**: extension/export/BatchExportManager.ts
- **行号**: 763
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 extension/export/BatchExportManager.ts 第 774 行发现可疑模式: Math.random()
- **文件**: extension/export/BatchExportManager.ts
- **行号**: 774
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 extension/export/ExportManager.ts 第 227 行发现可疑模式: Math.random()
- **文件**: extension/export/ExportManager.ts
- **行号**: 227
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 extension/export/ExportManager.ts 第 228 行发现可疑模式: Math.random()
- **文件**: extension/export/ExportManager.ts
- **行号**: 228
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 extension/export/ExportManager.ts 第 229 行发现可疑模式: Math.random()
- **文件**: extension/export/ExportManager.ts
- **行号**: 229
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 extension/export/ExportManager.ts 第 427 行发现可疑模式: Math.random()
- **文件**: extension/export/ExportManager.ts
- **行号**: 427
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 extension/export/exporters/JSONExporter.ts 第 515 行发现未验证的输入处理
- **文件**: extension/export/exporters/JSONExporter.ts
- **行号**: 515
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 extension/export/utils.ts 第 276 行发现可疑模式: Math.random()
- **文件**: extension/export/utils.ts
- **行号**: 276
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 extension/io/drivers/BluetoothLEDriver.ts 第 822 行发现可疑模式: Math.random()
- **文件**: extension/io/drivers/BluetoothLEDriver.ts
- **行号**: 822
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 extension/licensing/ConfigurationManager.ts 第 612 行发现未验证的输入处理
- **文件**: extension/licensing/ConfigurationManager.ts
- **行号**: 612
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 extension/licensing/ConfigurationManager.ts 第 676 行发现未验证的输入处理
- **文件**: extension/licensing/ConfigurationManager.ts
- **行号**: 676
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 extension/licensing/LicenseManager.ts 第 519 行发现未验证的输入处理
- **文件**: extension/licensing/LicenseManager.ts
- **行号**: 519
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 extension/licensing/LicenseManager.ts 第 659 行发现未验证的输入处理
- **文件**: extension/licensing/LicenseManager.ts
- **行号**: 659
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能记录敏感信息

- **级别**: MEDIUM
- **类别**: Information Disclosure
- **描述**: 在 extension/licensing/simple-test.ts 第 29 行发现可能记录敏感信息的日志
- **文件**: extension/licensing/simple-test.ts
- **行号**: 29
- **CWE ID**: CWE-532
- **建议**: 避免在日志中记录密码、令牌等敏感信息

### 🟠 可能记录敏感信息

- **级别**: MEDIUM
- **类别**: Information Disclosure
- **描述**: 在 extension/licensing/simple-test.ts 第 54 行发现可能记录敏感信息的日志
- **文件**: extension/licensing/simple-test.ts
- **行号**: 54
- **CWE ID**: CWE-532
- **建议**: 避免在日志中记录密码、令牌等敏感信息

### 🟠 可能记录敏感信息

- **级别**: MEDIUM
- **类别**: Information Disclosure
- **描述**: 在 extension/licensing/simple-test.ts 第 180 行发现可能记录敏感信息的日志
- **文件**: extension/licensing/simple-test.ts
- **行号**: 180
- **CWE ID**: CWE-532
- **建议**: 避免在日志中记录密码、令牌等敏感信息

### 🟠 可能记录敏感信息

- **级别**: MEDIUM
- **类别**: Information Disclosure
- **描述**: 在 extension/licensing/simple-test.ts 第 186 行发现可能记录敏感信息的日志
- **文件**: extension/licensing/simple-test.ts
- **行号**: 186
- **CWE ID**: CWE-532
- **建议**: 避免在日志中记录密码、令牌等敏感信息

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 extension/main.ts 第 447 行发现未验证的输入处理
- **文件**: extension/main.ts
- **行号**: 447
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 extension/parsing/Checksum.ts 第 51 行发现可疑模式: MD5(
- **文件**: extension/parsing/Checksum.ts
- **行号**: 51
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 extension/parsing/Checksum.ts 第 251 行发现可疑模式: MD5(
- **文件**: extension/parsing/Checksum.ts
- **行号**: 251
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 extension/parsing/Checksum.ts 第 54 行发现可疑模式: SHA1(
- **文件**: extension/parsing/Checksum.ts
- **行号**: 54
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 extension/parsing/Checksum.ts 第 260 行发现可疑模式: SHA1(
- **文件**: extension/parsing/Checksum.ts
- **行号**: 260
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 extension/parsing/Checksum.ts 第 252 行发现可疑模式: crypto.createHash('md5'
- **文件**: extension/parsing/Checksum.ts
- **行号**: 252
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 extension/parsing/Checksum.ts 第 261 行发现可疑模式: crypto.createHash('sha1'
- **文件**: extension/parsing/Checksum.ts
- **行号**: 261
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 extension/parsing/FrameParser.ts 第 428 行发现未验证的输入处理
- **文件**: extension/parsing/FrameParser.ts
- **行号**: 428
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 extension/plugins/PluginLoader.ts 第 35 行发现未验证的输入处理
- **文件**: extension/plugins/PluginLoader.ts
- **行号**: 35
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 extension/project/ProjectManager.ts 第 169 行发现未验证的输入处理
- **文件**: extension/project/ProjectManager.ts
- **行号**: 169
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 extension/project/ProjectSerializer.ts 第 226 行发现未验证的输入处理
- **文件**: extension/project/ProjectSerializer.ts
- **行号**: 226
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能记录敏感信息

- **级别**: MEDIUM
- **类别**: Information Disclosure
- **描述**: 在 extension/test-licensing.ts 第 72 行发现可能记录敏感信息的日志
- **文件**: extension/test-licensing.ts
- **行号**: 72
- **CWE ID**: CWE-532
- **建议**: 避免在日志中记录密码、令牌等敏感信息

### 🟠 可能记录敏感信息

- **级别**: MEDIUM
- **类别**: Information Disclosure
- **描述**: 在 extension/test-licensing.ts 第 76 行发现可能记录敏感信息的日志
- **文件**: extension/test-licensing.ts
- **行号**: 76
- **CWE ID**: CWE-532
- **建议**: 避免在日志中记录密码、令牌等敏感信息

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 extension/webview/ProjectEditorProvider.ts 第 497 行发现可疑模式: Math.random()
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 497
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 extension/webview/ProjectEditorProvider.ts 第 257 行发现未验证的输入处理
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 257
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 extension/webview/ProjectEditorProvider.ts 第 268 行发现未验证的输入处理
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 268
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 extension/webview/ProjectEditorProvider.ts 第 275 行发现未验证的输入处理
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 275
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 extension/webview/ProjectEditorProvider.ts 第 286 行发现未验证的输入处理
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 286
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 extension/webview/ProjectEditorProvider.ts 第 286 行发现未验证的输入处理
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 286
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 extension/webview/ProjectEditorProvider.ts 第 287 行发现未验证的输入处理
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 287
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 extension/webview/ProjectEditorProvider.ts 第 288 行发现未验证的输入处理
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 288
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 extension/webview/ProjectEditorProvider.ts 第 328 行发现未验证的输入处理
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 328
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 shared/FrameParser.ts 第 485 行发现未验证的输入处理
- **文件**: shared/FrameParser.ts
- **行号**: 485
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 shared/PerformanceMonitor.ts 第 512 行发现可疑模式: Math.random()
- **文件**: shared/PerformanceMonitor.ts
- **行号**: 512
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 shared/PerformanceMonitor.ts 第 513 行发现可疑模式: Math.random()
- **文件**: shared/PerformanceMonitor.ts
- **行号**: 513
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportIntegration.test.ts 第 445 行发现可疑模式: Math.random()
- **文件**: tests/export/ExportIntegration.test.ts
- **行号**: 445
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportIntegration.test.ts 第 446 行发现可疑模式: Math.random()
- **文件**: tests/export/ExportIntegration.test.ts
- **行号**: 446
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportIntegration.test.ts 第 447 行发现可疑模式: Math.random()
- **文件**: tests/export/ExportIntegration.test.ts
- **行号**: 447
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的File System Risks风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportIntegration.test.ts 第 97 行发现可疑模式: fs.readFileSync(
- **文件**: tests/export/ExportIntegration.test.ts
- **行号**: 97
- **CWE ID**: CWE-732
- **建议**: 限制文件系统访问权限，验证文件操作

### 🟠 潜在的File System Risks风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportIntegration.test.ts 第 116 行发现可疑模式: fs.readFileSync(
- **文件**: tests/export/ExportIntegration.test.ts
- **行号**: 116
- **CWE ID**: CWE-732
- **建议**: 限制文件系统访问权限，验证文件操作

### 🟠 潜在的File System Risks风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportIntegration.test.ts 第 135 行发现可疑模式: fs.readFileSync(
- **文件**: tests/export/ExportIntegration.test.ts
- **行号**: 135
- **CWE ID**: CWE-732
- **建议**: 限制文件系统访问权限，验证文件操作

### 🟠 潜在的File System Risks风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportIntegration.test.ts 第 159 行发现可疑模式: fs.readFileSync(
- **文件**: tests/export/ExportIntegration.test.ts
- **行号**: 159
- **CWE ID**: CWE-732
- **建议**: 限制文件系统访问权限，验证文件操作

### 🟠 潜在的File System Risks风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportIntegration.test.ts 第 160 行发现可疑模式: fs.readFileSync(
- **文件**: tests/export/ExportIntegration.test.ts
- **行号**: 160
- **CWE ID**: CWE-732
- **建议**: 限制文件系统访问权限，验证文件操作

### 🟠 潜在的File System Risks风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportIntegration.test.ts 第 215 行发现可疑模式: fs.readFileSync(
- **文件**: tests/export/ExportIntegration.test.ts
- **行号**: 215
- **CWE ID**: CWE-732
- **建议**: 限制文件系统访问权限，验证文件操作

### 🟠 潜在的File System Risks风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportIntegration.test.ts 第 237 行发现可疑模式: fs.readFileSync(
- **文件**: tests/export/ExportIntegration.test.ts
- **行号**: 237
- **CWE ID**: CWE-732
- **建议**: 限制文件系统访问权限，验证文件操作

### 🟠 潜在的File System Risks风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportIntegration.test.ts 第 238 行发现可疑模式: fs.readFileSync(
- **文件**: tests/export/ExportIntegration.test.ts
- **行号**: 238
- **CWE ID**: CWE-732
- **建议**: 限制文件系统访问权限，验证文件操作

### 🟠 潜在的File System Risks风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportIntegration.test.ts 第 265 行发现可疑模式: fs.readFileSync(
- **文件**: tests/export/ExportIntegration.test.ts
- **行号**: 265
- **CWE ID**: CWE-732
- **建议**: 限制文件系统访问权限，验证文件操作

### 🟠 潜在的File System Risks风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportIntegration.test.ts 第 291 行发现可疑模式: fs.readFileSync(
- **文件**: tests/export/ExportIntegration.test.ts
- **行号**: 291
- **CWE ID**: CWE-732
- **建议**: 限制文件系统访问权限，验证文件操作

### 🟠 潜在的File System Risks风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportIntegration.test.ts 第 78 行发现可疑模式: fs.rmSync(
- **文件**: tests/export/ExportIntegration.test.ts
- **行号**: 78
- **CWE ID**: CWE-732
- **建议**: 限制文件系统访问权限，验证文件操作

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 tests/export/ExportIntegration.test.ts 第 136 行发现未验证的输入处理
- **文件**: tests/export/ExportIntegration.test.ts
- **行号**: 136
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 tests/export/ExportIntegration.test.ts 第 159 行发现未验证的输入处理
- **文件**: tests/export/ExportIntegration.test.ts
- **行号**: 159
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 tests/export/ExportIntegration.test.ts 第 160 行发现未验证的输入处理
- **文件**: tests/export/ExportIntegration.test.ts
- **行号**: 160
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportPerformanceBenchmark.test.ts 第 69 行发现可疑模式: Math.random()
- **文件**: tests/export/ExportPerformanceBenchmark.test.ts
- **行号**: 69
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportPerformanceBenchmark.test.ts 第 70 行发现可疑模式: Math.random()
- **文件**: tests/export/ExportPerformanceBenchmark.test.ts
- **行号**: 70
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportPerformanceBenchmark.test.ts 第 564 行发现可疑模式: Math.random()
- **文件**: tests/export/ExportPerformanceBenchmark.test.ts
- **行号**: 564
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportPerformanceBenchmark.test.ts 第 565 行发现可疑模式: Math.random()
- **文件**: tests/export/ExportPerformanceBenchmark.test.ts
- **行号**: 565
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportPerformanceBenchmark.test.ts 第 566 行发现可疑模式: Math.random()
- **文件**: tests/export/ExportPerformanceBenchmark.test.ts
- **行号**: 566
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportQualityMetrics.test.ts 第 368 行发现可疑模式: Math.random()
- **文件**: tests/export/ExportQualityMetrics.test.ts
- **行号**: 368
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportQualityMetrics.test.ts 第 369 行发现可疑模式: Math.random()
- **文件**: tests/export/ExportQualityMetrics.test.ts
- **行号**: 369
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportQualityMetrics.test.ts 第 370 行发现可疑模式: Math.random()
- **文件**: tests/export/ExportQualityMetrics.test.ts
- **行号**: 370
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的File System Risks风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportQualityMetrics.test.ts 第 126 行发现可疑模式: fs.readFileSync(
- **文件**: tests/export/ExportQualityMetrics.test.ts
- **行号**: 126
- **CWE ID**: CWE-732
- **建议**: 限制文件系统访问权限，验证文件操作

### 🟠 潜在的File System Risks风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportQualityMetrics.test.ts 第 131 行发现可疑模式: fs.readFileSync(
- **文件**: tests/export/ExportQualityMetrics.test.ts
- **行号**: 131
- **CWE ID**: CWE-732
- **建议**: 限制文件系统访问权限，验证文件操作

### 🟠 潜在的File System Risks风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportQualityMetrics.test.ts 第 135 行发现可疑模式: fs.readFileSync(
- **文件**: tests/export/ExportQualityMetrics.test.ts
- **行号**: 135
- **CWE ID**: CWE-732
- **建议**: 限制文件系统访问权限，验证文件操作

### 🟠 潜在的File System Risks风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportQualityMetrics.test.ts 第 150 行发现可疑模式: fs.readFileSync(
- **文件**: tests/export/ExportQualityMetrics.test.ts
- **行号**: 150
- **CWE ID**: CWE-732
- **建议**: 限制文件系统访问权限，验证文件操作

### 🟠 潜在的File System Risks风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportQualityMetrics.test.ts 第 173 行发现可疑模式: fs.readFileSync(
- **文件**: tests/export/ExportQualityMetrics.test.ts
- **行号**: 173
- **CWE ID**: CWE-732
- **建议**: 限制文件系统访问权限，验证文件操作

### 🟠 潜在的File System Risks风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportQualityMetrics.test.ts 第 185 行发现可疑模式: fs.readFileSync(
- **文件**: tests/export/ExportQualityMetrics.test.ts
- **行号**: 185
- **CWE ID**: CWE-732
- **建议**: 限制文件系统访问权限，验证文件操作

### 🟠 潜在的File System Risks风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportQualityMetrics.test.ts 第 201 行发现可疑模式: fs.readFileSync(
- **文件**: tests/export/ExportQualityMetrics.test.ts
- **行号**: 201
- **CWE ID**: CWE-732
- **建议**: 限制文件系统访问权限，验证文件操作

### 🟠 潜在的File System Risks风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/export/ExportQualityMetrics.test.ts 第 36 行发现可疑模式: fs.rmSync(
- **文件**: tests/export/ExportQualityMetrics.test.ts
- **行号**: 36
- **CWE ID**: CWE-732
- **建议**: 限制文件系统访问权限，验证文件操作

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 tests/export/ExportQualityMetrics.test.ts 第 131 行发现未验证的输入处理
- **文件**: tests/export/ExportQualityMetrics.test.ts
- **行号**: 131
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 tests/export/ExportQualityMetrics.test.ts 第 150 行发现未验证的输入处理
- **文件**: tests/export/ExportQualityMetrics.test.ts
- **行号**: 150
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 tests/export/ExportQualityMetrics.test.ts 第 188 行发现未验证的输入处理
- **文件**: tests/export/ExportQualityMetrics.test.ts
- **行号**: 188
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 tests/export/ExportQualityMetrics.test.ts 第 190 行发现未验证的输入处理
- **文件**: tests/export/ExportQualityMetrics.test.ts
- **行号**: 190
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/integration/DataFlow.test.ts 第 236 行发现可疑模式: Math.random()
- **文件**: tests/integration/DataFlow.test.ts
- **行号**: 236
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/integration/DataFlow.test.ts 第 236 行发现可疑模式: Math.random()
- **文件**: tests/integration/DataFlow.test.ts
- **行号**: 236
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的File System Risks风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/integration/Implementation.test.ts 第 84 行发现可疑模式: fs.readFileSync(
- **文件**: tests/integration/Implementation.test.ts
- **行号**: 84
- **CWE ID**: CWE-732
- **建议**: 限制文件系统访问权限，验证文件操作

### 🟠 潜在的File System Risks风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/integration/Implementation.test.ts 第 97 行发现可疑模式: fs.readFileSync(
- **文件**: tests/integration/Implementation.test.ts
- **行号**: 97
- **CWE ID**: CWE-732
- **建议**: 限制文件系统访问权限，验证文件操作

### 🟠 潜在的File System Risks风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/integration/Implementation.test.ts 第 109 行发现可疑模式: fs.readFileSync(
- **文件**: tests/integration/Implementation.test.ts
- **行号**: 109
- **CWE ID**: CWE-732
- **建议**: 限制文件系统访问权限，验证文件操作

### 🟠 潜在的File System Risks风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/integration/Implementation.test.ts 第 123 行发现可疑模式: fs.readFileSync(
- **文件**: tests/integration/Implementation.test.ts
- **行号**: 123
- **CWE ID**: CWE-732
- **建议**: 限制文件系统访问权限，验证文件操作

### 🟠 潜在的File System Risks风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/integration/Implementation.test.ts 第 137 行发现可疑模式: fs.readFileSync(
- **文件**: tests/integration/Implementation.test.ts
- **行号**: 137
- **CWE ID**: CWE-732
- **建议**: 限制文件系统访问权限，验证文件操作

### 🟠 潜在的File System Risks风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/integration/Implementation.test.ts 第 150 行发现可疑模式: fs.readFileSync(
- **文件**: tests/integration/Implementation.test.ts
- **行号**: 150
- **CWE ID**: CWE-732
- **建议**: 限制文件系统访问权限，验证文件操作

### 🟠 潜在的File System Risks风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/integration/Implementation.test.ts 第 163 行发现可疑模式: fs.readFileSync(
- **文件**: tests/integration/Implementation.test.ts
- **行号**: 163
- **CWE ID**: CWE-732
- **建议**: 限制文件系统访问权限，验证文件操作

### 🟠 潜在的File System Risks风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/integration/Implementation.test.ts 第 180 行发现可疑模式: fs.readFileSync(
- **文件**: tests/integration/Implementation.test.ts
- **行号**: 180
- **CWE ID**: CWE-732
- **建议**: 限制文件系统访问权限，验证文件操作

### 🟠 潜在的File System Risks风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/integration/Implementation.test.ts 第 181 行发现可疑模式: fs.readFileSync(
- **文件**: tests/integration/Implementation.test.ts
- **行号**: 181
- **CWE ID**: CWE-732
- **建议**: 限制文件系统访问权限，验证文件操作

### 🟠 潜在的File System Risks风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/integration/Implementation.test.ts 第 219 行发现可疑模式: fs.readFileSync(
- **文件**: tests/integration/Implementation.test.ts
- **行号**: 219
- **CWE ID**: CWE-732
- **建议**: 限制文件系统访问权限，验证文件操作

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 176 行发现可疑模式: Math.random()
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 176
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/integration/PerformanceOptimizationIntegration.test.ts 第 228 行发现可疑模式: Math.random()
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 228
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 可能记录敏感信息

- **级别**: MEDIUM
- **类别**: Information Disclosure
- **描述**: 在 tests/integration/PerformanceOptimizationIntegration.test.ts 第 466 行发现可能记录敏感信息的日志
- **文件**: tests/integration/PerformanceOptimizationIntegration.test.ts
- **行号**: 466
- **CWE ID**: CWE-532
- **建议**: 避免在日志中记录密码、令牌等敏感信息

### 🟠 潜在的File System Risks风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/parsing/FrameParser.test.ts 第 274 行发现可疑模式: fs.readFileSync(
- **文件**: tests/parsing/FrameParser.test.ts
- **行号**: 274
- **CWE ID**: CWE-732
- **建议**: 限制文件系统访问权限，验证文件操作

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 tests/parsing/FrameParser.test.ts 第 98 行发现未验证的输入处理
- **文件**: tests/parsing/FrameParser.test.ts
- **行号**: 98
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 tests/parsing/FrameParser.test.ts 第 243 行发现未验证的输入处理
- **文件**: tests/parsing/FrameParser.test.ts
- **行号**: 243
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 49 行发现可疑模式: Math.random()
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 49
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 174 行发现可疑模式: Math.random()
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 174
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 208 行发现可疑模式: Math.random()
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 208
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/performance/Benchmarks.test.ts 第 247 行发现可疑模式: Math.random()
- **文件**: tests/performance/Benchmarks.test.ts
- **行号**: 247
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 134 行发现可疑模式: Math.random()
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 134
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 135 行发现可疑模式: Math.random()
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 135
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/performance/CorePerformanceTest.test.ts 第 236 行发现可疑模式: Math.random()
- **文件**: tests/performance/CorePerformanceTest.test.ts
- **行号**: 236
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 89 行发现可疑模式: Math.random()
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 89
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 159 行发现可疑模式: Math.random()
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 159
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 245 行发现可疑模式: Math.random()
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 245
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 246 行发现可疑模式: Math.random()
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 246
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 397 行发现可疑模式: Math.random()
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 397
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/performance/PerformanceOptimizationTest.test.ts 第 441 行发现可疑模式: Math.random()
- **文件**: tests/performance/PerformanceOptimizationTest.test.ts
- **行号**: 441
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 682 行发现可疑模式: Math.random()
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 682
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 683 行发现可疑模式: Math.random()
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 683
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 684 行发现可疑模式: Math.random()
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 684
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 685 行发现可疑模式: Math.random()
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 685
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 694 行发现可疑模式: Math.random()
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 694
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 702 行发现可疑模式: Math.random()
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 702
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 706 行发现可疑模式: Math.random()
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 706
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 707 行发现可疑模式: Math.random()
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 707
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 710 行发现可疑模式: Math.random()
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 710
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 711 行发现可疑模式: Math.random()
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 711
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 712 行发现可疑模式: Math.random()
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 712
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 713 行发现可疑模式: Math.random()
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 713
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 714 行发现可疑模式: Math.random()
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 714
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 715 行发现可疑模式: Math.random()
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 715
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 716 行发现可疑模式: Math.random()
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 716
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 717 行发现可疑模式: Math.random()
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 717
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 718 行发现可疑模式: Math.random()
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 718
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 tests/project/ImportExportIntegration.test.ts 第 719 行发现可疑模式: Math.random()
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 719
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 tests/project/ImportExportIntegration.test.ts 第 216 行发现未验证的输入处理
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 216
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 tests/project/ImportExportIntegration.test.ts 第 540 行发现未验证的输入处理
- **文件**: tests/project/ImportExportIntegration.test.ts
- **行号**: 540
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 tests/project/ProjectManager.test.ts 第 322 行发现未验证的输入处理
- **文件**: tests/project/ProjectManager.test.ts
- **行号**: 322
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 tests/project/ProjectSerializer.test.ts 第 281 行发现未验证的输入处理
- **文件**: tests/project/ProjectSerializer.test.ts
- **行号**: 281
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/WidgetExportDialog.vue 第 402 行发现可疑模式: Math.random()
- **文件**: webview/components/dialogs/WidgetExportDialog.vue
- **行号**: 402
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/WidgetExportDialog.vue 第 418 行发现可疑模式: Math.random()
- **文件**: webview/components/dialogs/WidgetExportDialog.vue
- **行号**: 418
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/WidgetExportDialog.vue 第 435 行发现可疑模式: Math.random()
- **文件**: webview/components/dialogs/WidgetExportDialog.vue
- **行号**: 435
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/WidgetExportDialog.vue 第 436 行发现可疑模式: Math.random()
- **文件**: webview/components/dialogs/WidgetExportDialog.vue
- **行号**: 436
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/components/dialogs/WidgetExportDialog.vue 第 437 行发现可疑模式: Math.random()
- **文件**: webview/components/dialogs/WidgetExportDialog.vue
- **行号**: 437
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/components/test/GPSWidgetTest.vue 第 214 行发现可疑模式: Math.random()
- **文件**: webview/components/test/GPSWidgetTest.vue
- **行号**: 214
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/components/test/GPSWidgetTest.vue 第 218 行发现可疑模式: Math.random()
- **文件**: webview/components/test/GPSWidgetTest.vue
- **行号**: 218
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/components/test/GPSWidgetTest.vue 第 258 行发现可疑模式: Math.random()
- **文件**: webview/components/test/GPSWidgetTest.vue
- **行号**: 258
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/components/test/GPSWidgetTest.vue 第 261 行发现可疑模式: Math.random()
- **文件**: webview/components/test/GPSWidgetTest.vue
- **行号**: 261
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/components/test/GPSWidgetTest.vue 第 262 行发现可疑模式: Math.random()
- **文件**: webview/components/test/GPSWidgetTest.vue
- **行号**: 262
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/components/test/Plot3DWidgetTest.vue 第 269 行发现可疑模式: Math.random()
- **文件**: webview/components/test/Plot3DWidgetTest.vue
- **行号**: 269
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/components/test/Plot3DWidgetTest.vue 第 270 行发现可疑模式: Math.random()
- **文件**: webview/components/test/Plot3DWidgetTest.vue
- **行号**: 270
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/components/test/Plot3DWidgetTest.vue 第 271 行发现可疑模式: Math.random()
- **文件**: webview/components/test/Plot3DWidgetTest.vue
- **行号**: 271
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/AccelerometerWidget.vue 第 512 行发现可疑模式: Math.random()
- **文件**: webview/components/widgets/AccelerometerWidget.vue
- **行号**: 512
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/AccelerometerWidget.vue 第 513 行发现可疑模式: Math.random()
- **文件**: webview/components/widgets/AccelerometerWidget.vue
- **行号**: 513
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/AccelerometerWidget.vue 第 514 行发现可疑模式: Math.random()
- **文件**: webview/components/widgets/AccelerometerWidget.vue
- **行号**: 514
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/BarWidget.vue 第 373 行发现可疑模式: Math.random()
- **文件**: webview/components/widgets/BarWidget.vue
- **行号**: 373
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/BarWidget.vue 第 511 行发现可疑模式: Math.random()
- **文件**: webview/components/widgets/BarWidget.vue
- **行号**: 511
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/CompassWidget.vue 第 509 行发现可疑模式: Math.random()
- **文件**: webview/components/widgets/CompassWidget.vue
- **行号**: 509
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/CompassWidget.vue 第 511 行发现可疑模式: Math.random()
- **文件**: webview/components/widgets/CompassWidget.vue
- **行号**: 511
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/DataGridWidget.vue 第 465 行发现可疑模式: Math.random()
- **文件**: webview/components/widgets/DataGridWidget.vue
- **行号**: 465
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/DataGridWidget.vue 第 626 行发现可疑模式: Math.random()
- **文件**: webview/components/widgets/DataGridWidget.vue
- **行号**: 626
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/DataGridWidget.vue 第 630 行发现可疑模式: Math.random()
- **文件**: webview/components/widgets/DataGridWidget.vue
- **行号**: 630
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/DataGridWidget.vue 第 633 行发现可疑模式: Math.random()
- **文件**: webview/components/widgets/DataGridWidget.vue
- **行号**: 633
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/DataGridWidget.vue 第 636 行发现可疑模式: Math.random()
- **文件**: webview/components/widgets/DataGridWidget.vue
- **行号**: 636
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GaugeWidget.vue 第 581 行发现可疑模式: Math.random()
- **文件**: webview/components/widgets/GaugeWidget.vue
- **行号**: 581
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GyroscopeWidget.vue 第 635 行发现可疑模式: Math.random()
- **文件**: webview/components/widgets/GyroscopeWidget.vue
- **行号**: 635
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GyroscopeWidget.vue 第 636 行发现可疑模式: Math.random()
- **文件**: webview/components/widgets/GyroscopeWidget.vue
- **行号**: 636
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/GyroscopeWidget.vue 第 637 行发现可疑模式: Math.random()
- **文件**: webview/components/widgets/GyroscopeWidget.vue
- **行号**: 637
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/LEDWidget.vue 第 397 行发现可疑模式: Math.random()
- **文件**: webview/components/widgets/LEDWidget.vue
- **行号**: 397
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/LEDWidget.vue 第 513 行发现可疑模式: Math.random()
- **文件**: webview/components/widgets/LEDWidget.vue
- **行号**: 513
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/LEDWidget.vue 第 514 行发现可疑模式: Math.random()
- **文件**: webview/components/widgets/LEDWidget.vue
- **行号**: 514
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/LEDWidget.vue 第 515 行发现可疑模式: Math.random()
- **文件**: webview/components/widgets/LEDWidget.vue
- **行号**: 515
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/LEDWidget.vue 第 520 行发现可疑模式: Math.random()
- **文件**: webview/components/widgets/LEDWidget.vue
- **行号**: 520
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/LEDWidget.vue 第 522 行发现可疑模式: Math.random()
- **文件**: webview/components/widgets/LEDWidget.vue
- **行号**: 522
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/PlotWidget.vue 第 527 行发现可疑模式: Math.random()
- **文件**: webview/components/widgets/PlotWidget.vue
- **行号**: 527
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/TerminalWidget.vue 第 390 行发现可疑模式: Math.random()
- **文件**: webview/components/widgets/TerminalWidget.vue
- **行号**: 390
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/TerminalWidget.vue 第 599 行发现可疑模式: Math.random()
- **文件**: webview/components/widgets/TerminalWidget.vue
- **行号**: 599
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/components/widgets/TerminalWidget.vue 第 600 行发现可疑模式: Math.random()
- **文件**: webview/components/widgets/TerminalWidget.vue
- **行号**: 600
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 webview/stores/connection.ts 第 328 行发现未验证的输入处理
- **文件**: webview/stores/connection.ts
- **行号**: 328
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/stores/layout.ts 第 268 行发现可疑模式: Math.random()
- **文件**: webview/stores/layout.ts
- **行号**: 268
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/stores/layout.ts 第 325 行发现可疑模式: Math.random()
- **文件**: webview/stores/layout.ts
- **行号**: 325
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/stores/layout.ts 第 451 行发现可疑模式: Math.random()
- **文件**: webview/stores/layout.ts
- **行号**: 451
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 webview/stores/layout.ts 第 606 行发现未验证的输入处理
- **文件**: webview/stores/layout.ts
- **行号**: 606
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 webview/stores/performance.ts 第 559 行发现未验证的输入处理
- **文件**: webview/stores/performance.ts
- **行号**: 559
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 webview/stores/projectStore.ts 第 141 行发现未验证的输入处理
- **文件**: webview/stores/projectStore.ts
- **行号**: 141
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 webview/stores/projectStore.ts 第 143 行发现未验证的输入处理
- **文件**: webview/stores/projectStore.ts
- **行号**: 143
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 webview/stores/projectStore.ts 第 463 行发现未验证的输入处理
- **文件**: webview/stores/projectStore.ts
- **行号**: 463
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 webview/stores/projectStore.ts 第 425 行发现未验证的输入处理
- **文件**: webview/stores/projectStore.ts
- **行号**: 425
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 webview/stores/projectStore.ts 第 426 行发现未验证的输入处理
- **文件**: webview/stores/projectStore.ts
- **行号**: 426
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 webview/stores/projectStore.ts 第 427 行发现未验证的输入处理
- **文件**: webview/stores/projectStore.ts
- **行号**: 427
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 webview/stores/projectStore.ts 第 428 行发现未验证的输入处理
- **文件**: webview/stores/projectStore.ts
- **行号**: 428
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 webview/stores/projectStore.ts 第 432 行发现未验证的输入处理
- **文件**: webview/stores/projectStore.ts
- **行号**: 432
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 webview/stores/projectStore.ts 第 437 行发现未验证的输入处理
- **文件**: webview/stores/projectStore.ts
- **行号**: 437
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 webview/stores/projectStore.ts 第 441 行发现未验证的输入处理
- **文件**: webview/stores/projectStore.ts
- **行号**: 441
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 webview/stores/projectStore.ts 第 445 行发现未验证的输入处理
- **文件**: webview/stores/projectStore.ts
- **行号**: 445
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 webview/stores/theme.ts 第 400 行发现未验证的输入处理
- **文件**: webview/stores/theme.ts
- **行号**: 400
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 webview/stores/theme.ts 第 478 行发现未验证的输入处理
- **文件**: webview/stores/theme.ts
- **行号**: 478
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 184 行发现可疑模式: Math.random()
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 184
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 334 行发现可疑模式: Math.random()
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 334
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 335 行发现可疑模式: Math.random()
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 335
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 336 行发现可疑模式: Math.random()
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 336
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 337 行发现可疑模式: Math.random()
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 337
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 474 行发现可疑模式: Math.random()
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 474
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 475 行发现可疑模式: Math.random()
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 475
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 513 行发现可疑模式: Math.random()
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 513
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 649 行发现可疑模式: Math.random()
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 649
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 650 行发现可疑模式: Math.random()
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 650
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 651 行发现可疑模式: Math.random()
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 651
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 652 行发现可疑模式: Math.random()
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 652
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 653 行发现可疑模式: Math.random()
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 653
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 667 行发现可疑模式: Math.random()
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 667
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 686 行发现可疑模式: Math.random()
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 686
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 94 行发现可疑模式: Math.random()
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 94
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 95 行发现可疑模式: Math.random()
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 95
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 96 行发现可疑模式: Math.random()
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 96
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 97 行发现可疑模式: Math.random()
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 97
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 98 行发现可疑模式: Math.random()
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 98
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 135 行发现可疑模式: Math.random()
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 135
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 174 行发现可疑模式: Math.random()
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 174
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 213 行发现可疑模式: Math.random()
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 213
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 304 行发现可疑模式: Math.random()
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 304
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 322 行发现可疑模式: Math.random()
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 322
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 369 行发现可疑模式: Math.random()
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 369
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 375 行发现可疑模式: Math.random()
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 375
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的File System Risks风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/tests/performance-benchmark.ts 第 434 行发现可疑模式: fs.writeFileSync(
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 434
- **CWE ID**: CWE-732
- **建议**: 限制文件系统访问权限，验证文件操作

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 365 行发现可疑模式: Math.random()
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 365
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 489 行发现可疑模式: Math.random()
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 489
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 649 行发现可疑模式: Math.random()
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 649
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 潜在的Unsafe Crypto风险

- **级别**: MEDIUM
- **类别**: Code Security
- **描述**: 在文件 webview/tests/run-integration-tests.ts 第 669 行发现可疑模式: Math.random()
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 669
- **CWE ID**: CWE-327
- **建议**: 使用现代的加密算法（如AES-256, SHA-256等）

### 🟠 可能记录敏感信息

- **级别**: MEDIUM
- **类别**: Information Disclosure
- **描述**: 在 webview/tests/run-integration-tests.ts 第 770 行发现可能记录敏感信息的日志
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 770
- **CWE ID**: CWE-532
- **建议**: 避免在日志中记录密码、令牌等敏感信息

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 webview/utils/MessageBridge.ts 第 29 行发现未验证的输入处理
- **文件**: webview/utils/MessageBridge.ts
- **行号**: 29
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 webview/utils/ThemeManager.ts 第 256 行发现未验证的输入处理
- **文件**: webview/utils/ThemeManager.ts
- **行号**: 256
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 可能缺少输入验证

- **级别**: MEDIUM
- **类别**: Input Validation
- **描述**: 在 webview/utils/ThemeManager.ts 第 661 行发现未验证的输入处理
- **文件**: webview/utils/ThemeManager.ts
- **行号**: 661
- **CWE ID**: CWE-20
- **建议**: 添加适当的输入验证和清理逻辑

### 🟠 不安全的网络连接

- **级别**: MEDIUM
- **类别**: Network Security
- **描述**: 在 tests/parsing/FrameParser.test.ts 第 287 行发现不安全的网络配置
- **文件**: tests/parsing/FrameParser.test.ts
- **行号**: 287
- **CWE ID**: CWE-319
- **建议**: 使用HTTPS/WSS协议，启用证书验证

### 🟠 不安全的网络连接

- **级别**: MEDIUM
- **类别**: Network Security
- **描述**: 在 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 98 行发现不安全的网络配置
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 98
- **CWE ID**: CWE-319
- **建议**: 使用HTTPS/WSS协议，启用证书验证

### 🟠 不安全的网络连接

- **级别**: MEDIUM
- **类别**: Network Security
- **描述**: 在 webview/components/dialogs/format-options/XMLFormatOptions.vue 第 278 行发现不安全的网络配置
- **文件**: webview/components/dialogs/format-options/XMLFormatOptions.vue
- **行号**: 278
- **CWE ID**: CWE-319
- **建议**: 使用HTTPS/WSS协议，启用证书验证

### 🔵 依赖版本不固定: @abandonware/noble

- **级别**: LOW
- **类别**: Dependency Security
- **描述**: 依赖 @abandonware/noble 使用了范围版本 ^1.9.2-15，可能引入不可预期的更新
- **建议**: 考虑使用固定版本号以提高安全性和可重现性

### 🔵 依赖版本不固定: @msgpack/msgpack

- **级别**: LOW
- **类别**: Dependency Security
- **描述**: 依赖 @msgpack/msgpack 使用了范围版本 ^3.0.0，可能引入不可预期的更新
- **建议**: 考虑使用固定版本号以提高安全性和可重现性

### 🔵 依赖版本不固定: @types/d3

- **级别**: LOW
- **类别**: Dependency Security
- **描述**: 依赖 @types/d3 使用了范围版本 ^7.4.3，可能引入不可预期的更新
- **建议**: 考虑使用固定版本号以提高安全性和可重现性

### 🔵 依赖版本不固定: @types/leaflet

- **级别**: LOW
- **类别**: Dependency Security
- **描述**: 依赖 @types/leaflet 使用了范围版本 ^1.9.20，可能引入不可预期的更新
- **建议**: 考虑使用固定版本号以提高安全性和可重现性

### 🔵 依赖版本不固定: @types/three

- **级别**: LOW
- **类别**: Dependency Security
- **描述**: 依赖 @types/three 使用了范围版本 ^0.178.1，可能引入不可预期的更新
- **建议**: 考虑使用固定版本号以提高安全性和可重现性

### 🔵 依赖版本不固定: ajv

- **级别**: LOW
- **类别**: Dependency Security
- **描述**: 依赖 ajv 使用了范围版本 ^8.12.0，可能引入不可预期的更新
- **建议**: 考虑使用固定版本号以提高安全性和可重现性

### 🔵 依赖版本不固定: chart.js

- **级别**: LOW
- **类别**: Dependency Security
- **描述**: 依赖 chart.js 使用了范围版本 ^4.5.0，可能引入不可预期的更新
- **建议**: 考虑使用固定版本号以提高安全性和可重现性

### 🔵 依赖版本不固定: comlink

- **级别**: LOW
- **类别**: Dependency Security
- **描述**: 依赖 comlink 使用了范围版本 ^4.4.0，可能引入不可预期的更新
- **建议**: 考虑使用固定版本号以提高安全性和可重现性

### 🔵 依赖版本不固定: csv-parser

- **级别**: LOW
- **类别**: Dependency Security
- **描述**: 依赖 csv-parser 使用了范围版本 ^3.0.0，可能引入不可预期的更新
- **建议**: 考虑使用固定版本号以提高安全性和可重现性

### 🔵 依赖版本不固定: d3

- **级别**: LOW
- **类别**: Dependency Security
- **描述**: 依赖 d3 使用了范围版本 ^7.9.0，可能引入不可预期的更新
- **建议**: 考虑使用固定版本号以提高安全性和可重现性

### 🔵 依赖版本不固定: element-plus

- **级别**: LOW
- **类别**: Dependency Security
- **描述**: 依赖 element-plus 使用了范围版本 ^2.10.4，可能引入不可预期的更新
- **建议**: 考虑使用固定版本号以提高安全性和可重现性

### 🔵 依赖版本不固定: exceljs

- **级别**: LOW
- **类别**: Dependency Security
- **描述**: 依赖 exceljs 使用了范围版本 ^4.3.0，可能引入不可预期的更新
- **建议**: 考虑使用固定版本号以提高安全性和可重现性

### 🔵 依赖版本不固定: fft.js

- **级别**: LOW
- **类别**: Dependency Security
- **描述**: 依赖 fft.js 使用了范围版本 ^4.0.4，可能引入不可预期的更新
- **建议**: 考虑使用固定版本号以提高安全性和可重现性

### 🔵 依赖版本不固定: jszip

- **级别**: LOW
- **类别**: Dependency Security
- **描述**: 依赖 jszip 使用了范围版本 ^3.10.0，可能引入不可预期的更新
- **建议**: 考虑使用固定版本号以提高安全性和可重现性

### 🔵 依赖版本不固定: leaflet

- **级别**: LOW
- **类别**: Dependency Security
- **描述**: 依赖 leaflet 使用了范围版本 ^1.9.4，可能引入不可预期的更新
- **建议**: 考虑使用固定版本号以提高安全性和可重现性

### 🔵 依赖版本不固定: lz4js

- **级别**: LOW
- **类别**: Dependency Security
- **描述**: 依赖 lz4js 使用了范围版本 ^0.2.0，可能引入不可预期的更新
- **建议**: 考虑使用固定版本号以提高安全性和可重现性

### 🔵 依赖版本不固定: ml-fft

- **级别**: LOW
- **类别**: Dependency Security
- **描述**: 依赖 ml-fft 使用了范围版本 ^1.3.5，可能引入不可预期的更新
- **建议**: 考虑使用固定版本号以提高安全性和可重现性

### 🔵 依赖版本不固定: pinia

- **级别**: LOW
- **类别**: Dependency Security
- **描述**: 依赖 pinia 使用了范围版本 ^2.3.1，可能引入不可预期的更新
- **建议**: 考虑使用固定版本号以提高安全性和可重现性

### 🔵 依赖版本不固定: serialport

- **级别**: LOW
- **类别**: Dependency Security
- **描述**: 依赖 serialport 使用了范围版本 ^12.0.0，可能引入不可预期的更新
- **建议**: 考虑使用固定版本号以提高安全性和可重现性

### 🔵 依赖版本不固定: three

- **级别**: LOW
- **类别**: Dependency Security
- **描述**: 依赖 three 使用了范围版本 ^0.178.0，可能引入不可预期的更新
- **建议**: 考虑使用固定版本号以提高安全性和可重现性

### 🔵 依赖版本不固定: vm2

- **级别**: LOW
- **类别**: Dependency Security
- **描述**: 依赖 vm2 使用了范围版本 ^3.9.0，可能引入不可预期的更新
- **建议**: 考虑使用固定版本号以提高安全性和可重现性

### 🔵 依赖版本不固定: vue

- **级别**: LOW
- **类别**: Dependency Security
- **描述**: 依赖 vue 使用了范围版本 ^3.5.18，可能引入不可预期的更新
- **建议**: 考虑使用固定版本号以提高安全性和可重现性

### 🔵 依赖版本不固定: ws

- **级别**: LOW
- **类别**: Dependency Security
- **描述**: 依赖 ws 使用了范围版本 ^8.14.0，可能引入不可预期的更新
- **建议**: 考虑使用固定版本号以提高安全性和可重现性

### 🔵 依赖版本不固定: xml2js

- **级别**: LOW
- **类别**: Dependency Security
- **描述**: 依赖 xml2js 使用了范围版本 ^0.6.0，可能引入不可预期的更新
- **建议**: 考虑使用固定版本号以提高安全性和可重现性

### 🔵 依赖版本不固定: @types/vscode

- **级别**: LOW
- **类别**: Dependency Security
- **描述**: 依赖 @types/vscode 使用了范围版本 ^1.74.0，可能引入不可预期的更新
- **建议**: 考虑使用固定版本号以提高安全性和可重现性

### 🔵 依赖版本不固定: @types/vue

- **级别**: LOW
- **类别**: Dependency Security
- **描述**: 依赖 @types/vue 使用了范围版本 ^1.0.31，可能引入不可预期的更新
- **建议**: 考虑使用固定版本号以提高安全性和可重现性

### 🔵 依赖版本不固定: @typescript-eslint/eslint-plugin

- **级别**: LOW
- **类别**: Dependency Security
- **描述**: 依赖 @typescript-eslint/eslint-plugin 使用了范围版本 ^5.45.0，可能引入不可预期的更新
- **建议**: 考虑使用固定版本号以提高安全性和可重现性

### 🔵 依赖版本不固定: @typescript-eslint/parser

- **级别**: LOW
- **类别**: Dependency Security
- **描述**: 依赖 @typescript-eslint/parser 使用了范围版本 ^5.45.0，可能引入不可预期的更新
- **建议**: 考虑使用固定版本号以提高安全性和可重现性

### 🔵 依赖版本不固定: @vitest/coverage-v8

- **级别**: LOW
- **类别**: Dependency Security
- **描述**: 依赖 @vitest/coverage-v8 使用了范围版本 ^1.0.0，可能引入不可预期的更新
- **建议**: 考虑使用固定版本号以提高安全性和可重现性

### 🔵 依赖版本不固定: eslint

- **级别**: LOW
- **类别**: Dependency Security
- **描述**: 依赖 eslint 使用了范围版本 ^8.28.0，可能引入不可预期的更新
- **建议**: 考虑使用固定版本号以提高安全性和可重现性

### 🔵 依赖版本不固定: ts-loader

- **级别**: LOW
- **类别**: Dependency Security
- **描述**: 依赖 ts-loader 使用了范围版本 ^9.4.1，可能引入不可预期的更新
- **建议**: 考虑使用固定版本号以提高安全性和可重现性

### 🔵 依赖版本不固定: typescript

- **级别**: LOW
- **类别**: Dependency Security
- **描述**: 依赖 typescript 使用了范围版本 ^4.9.4，可能引入不可预期的更新
- **建议**: 考虑使用固定版本号以提高安全性和可重现性

### 🔵 依赖版本不固定: vitest

- **级别**: LOW
- **类别**: Dependency Security
- **描述**: 依赖 vitest 使用了范围版本 ^1.0.0，可能引入不可预期的更新
- **建议**: 考虑使用固定版本号以提高安全性和可重现性

### 🔵 依赖版本不固定: webpack

- **级别**: LOW
- **类别**: Dependency Security
- **描述**: 依赖 webpack 使用了范围版本 ^5.75.0，可能引入不可预期的更新
- **建议**: 考虑使用固定版本号以提高安全性和可重现性

### 🔵 依赖版本不固定: webpack-cli

- **级别**: LOW
- **类别**: Dependency Security
- **描述**: 依赖 webpack-cli 使用了范围版本 ^5.0.0，可能引入不可预期的更新
- **建议**: 考虑使用固定版本号以提高安全性和可重现性

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/export/BatchExportManager.ts 第 671 行发现可能暴露内部信息的错误处理
- **文件**: extension/export/BatchExportManager.ts
- **行号**: 671
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/export/DataTransformer.ts 第 251 行发现可能暴露内部信息的错误处理
- **文件**: extension/export/DataTransformer.ts
- **行号**: 251
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/export/DataTransformer.ts 第 274 行发现可能暴露内部信息的错误处理
- **文件**: extension/export/DataTransformer.ts
- **行号**: 274
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/export/ExportManager.ts 第 401 行发现可能暴露内部信息的错误处理
- **文件**: extension/export/ExportManager.ts
- **行号**: 401
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/io/DriverFactory.ts 第 149 行发现可能暴露内部信息的错误处理
- **文件**: extension/io/DriverFactory.ts
- **行号**: 149
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/io/DriverFactory.ts 第 153 行发现可能暴露内部信息的错误处理
- **文件**: extension/io/DriverFactory.ts
- **行号**: 153
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/io/DriverFactory.ts 第 159 行发现可能暴露内部信息的错误处理
- **文件**: extension/io/DriverFactory.ts
- **行号**: 159
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/io/DriverFactory.ts 第 196 行发现可能暴露内部信息的错误处理
- **文件**: extension/io/DriverFactory.ts
- **行号**: 196
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/io/DriverFactory.ts 第 437 行发现可能暴露内部信息的错误处理
- **文件**: extension/io/DriverFactory.ts
- **行号**: 437
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/io/drivers/BluetoothLEDriver.ts 第 702 行发现可能暴露内部信息的错误处理
- **文件**: extension/io/drivers/BluetoothLEDriver.ts
- **行号**: 702
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/io/drivers/BluetoothLEDriver.ts 第 305 行发现可能暴露内部信息的错误处理
- **文件**: extension/io/drivers/BluetoothLEDriver.ts
- **行号**: 305
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/io/drivers/BluetoothLEDriver.ts 第 451 行发现可能暴露内部信息的错误处理
- **文件**: extension/io/drivers/BluetoothLEDriver.ts
- **行号**: 451
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/io/drivers/NetworkDriver.ts 第 486 行发现可能暴露内部信息的错误处理
- **文件**: extension/io/drivers/NetworkDriver.ts
- **行号**: 486
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/io/drivers/NetworkDriver.ts 第 151 行发现可能暴露内部信息的错误处理
- **文件**: extension/io/drivers/NetworkDriver.ts
- **行号**: 151
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/io/drivers/UARTDriver.ts 第 125 行发现可能暴露内部信息的错误处理
- **文件**: extension/io/drivers/UARTDriver.ts
- **行号**: 125
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/io/drivers/UARTDriver.ts 第 141 行发现可能暴露内部信息的错误处理
- **文件**: extension/io/drivers/UARTDriver.ts
- **行号**: 141
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/licensing/ConfigurationManager.ts 第 411 行发现可能暴露内部信息的错误处理
- **文件**: extension/licensing/ConfigurationManager.ts
- **行号**: 411
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/licensing/ConfigurationManager.ts 第 482 行发现可能暴露内部信息的错误处理
- **文件**: extension/licensing/ConfigurationManager.ts
- **行号**: 482
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/licensing/ConfigurationManager.ts 第 516 行发现可能暴露内部信息的错误处理
- **文件**: extension/licensing/ConfigurationManager.ts
- **行号**: 516
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/licensing/ConfigurationManager.ts 第 552 行发现可能暴露内部信息的错误处理
- **文件**: extension/licensing/ConfigurationManager.ts
- **行号**: 552
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/licensing/LicenseManager.ts 第 329 行发现可能暴露内部信息的错误处理
- **文件**: extension/licensing/LicenseManager.ts
- **行号**: 329
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/licensing/LicenseManager.ts 第 362 行发现可能暴露内部信息的错误处理
- **文件**: extension/licensing/LicenseManager.ts
- **行号**: 362
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/licensing/LicenseManager.ts 第 395 行发现可能暴露内部信息的错误处理
- **文件**: extension/licensing/LicenseManager.ts
- **行号**: 395
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/licensing/LicenseManager.ts 第 667 行发现可能暴露内部信息的错误处理
- **文件**: extension/licensing/LicenseManager.ts
- **行号**: 667
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/licensing/LicenseManager.ts 第 685 行发现可能暴露内部信息的错误处理
- **文件**: extension/licensing/LicenseManager.ts
- **行号**: 685
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/licensing/LicensingIntegrationTest.ts 第 580 行发现可能暴露内部信息的错误处理
- **文件**: extension/licensing/LicensingIntegrationTest.ts
- **行号**: 580
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/licensing/LicensingIntegrationTest.ts 第 476 行发现可能暴露内部信息的错误处理
- **文件**: extension/licensing/LicensingIntegrationTest.ts
- **行号**: 476
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/licensing/LicensingIntegrationTest.ts 第 502 行发现可能暴露内部信息的错误处理
- **文件**: extension/licensing/LicensingIntegrationTest.ts
- **行号**: 502
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/licensing/LicensingIntegrationTest.ts 第 531 行发现可能暴露内部信息的错误处理
- **文件**: extension/licensing/LicensingIntegrationTest.ts
- **行号**: 531
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/licensing/SimpleCrypt.ts 第 131 行发现可能暴露内部信息的错误处理
- **文件**: extension/licensing/SimpleCrypt.ts
- **行号**: 131
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/licensing/SimpleCrypt.ts 第 189 行发现可能暴露内部信息的错误处理
- **文件**: extension/licensing/SimpleCrypt.ts
- **行号**: 189
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/licensing/simple-test.ts 第 259 行发现可能暴露内部信息的错误处理
- **文件**: extension/licensing/simple-test.ts
- **行号**: 259
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/licensing/simple-test.ts 第 38 行发现可能暴露内部信息的错误处理
- **文件**: extension/licensing/simple-test.ts
- **行号**: 38
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/licensing/simple-test.ts 第 63 行发现可能暴露内部信息的错误处理
- **文件**: extension/licensing/simple-test.ts
- **行号**: 63
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/licensing/simple-test.ts 第 89 行发现可能暴露内部信息的错误处理
- **文件**: extension/licensing/simple-test.ts
- **行号**: 89
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/licensing/simple-test.ts 第 121 行发现可能暴露内部信息的错误处理
- **文件**: extension/licensing/simple-test.ts
- **行号**: 121
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/licensing/simple-test.ts 第 164 行发现可能暴露内部信息的错误处理
- **文件**: extension/licensing/simple-test.ts
- **行号**: 164
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/licensing/simple-test.ts 第 205 行发现可能暴露内部信息的错误处理
- **文件**: extension/licensing/simple-test.ts
- **行号**: 205
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/main.ts 第 457 行发现可能暴露内部信息的错误处理
- **文件**: extension/main.ts
- **行号**: 457
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/main.ts 第 572 行发现可能暴露内部信息的错误处理
- **文件**: extension/main.ts
- **行号**: 572
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/parsing/Checksum.ts 第 342 行发现可能暴露内部信息的错误处理
- **文件**: extension/parsing/Checksum.ts
- **行号**: 342
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/parsing/Checksum.ts 第 73 行发现可能暴露内部信息的错误处理
- **文件**: extension/parsing/Checksum.ts
- **行号**: 73
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/parsing/DataDecoder.ts 第 38 行发现可能暴露内部信息的错误处理
- **文件**: extension/parsing/DataDecoder.ts
- **行号**: 38
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/parsing/DataDecoder.ts 第 132 行发现可能暴露内部信息的错误处理
- **文件**: extension/parsing/DataDecoder.ts
- **行号**: 132
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/parsing/DataDecoder.ts 第 35 行发现可能暴露内部信息的错误处理
- **文件**: extension/parsing/DataDecoder.ts
- **行号**: 35
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/parsing/DataDecoder.ts 第 129 行发现可能暴露内部信息的错误处理
- **文件**: extension/parsing/DataDecoder.ts
- **行号**: 129
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/parsing/FrameParser.ts 第 431 行发现可能暴露内部信息的错误处理
- **文件**: extension/parsing/FrameParser.ts
- **行号**: 431
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/parsing/FrameReader.ts 第 324 行发现可能暴露内部信息的错误处理
- **文件**: extension/parsing/FrameReader.ts
- **行号**: 324
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/plugins/ContributionRegistry.ts 第 369 行发现可能暴露内部信息的错误处理
- **文件**: extension/plugins/ContributionRegistry.ts
- **行号**: 369
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/plugins/ContributionRegistry.ts 第 90 行发现可能暴露内部信息的错误处理
- **文件**: extension/plugins/ContributionRegistry.ts
- **行号**: 90
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/plugins/ContributionRegistry.ts 第 145 行发现可能暴露内部信息的错误处理
- **文件**: extension/plugins/ContributionRegistry.ts
- **行号**: 145
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/plugins/ContributionRegistry.ts 第 165 行发现可能暴露内部信息的错误处理
- **文件**: extension/plugins/ContributionRegistry.ts
- **行号**: 165
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/plugins/PluginLoader.ts 第 43 行发现可能暴露内部信息的错误处理
- **文件**: extension/plugins/PluginLoader.ts
- **行号**: 43
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/plugins/PluginLoader.ts 第 113 行发现可能暴露内部信息的错误处理
- **文件**: extension/plugins/PluginLoader.ts
- **行号**: 113
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/plugins/PluginLoader.ts 第 176 行发现可能暴露内部信息的错误处理
- **文件**: extension/plugins/PluginLoader.ts
- **行号**: 176
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/plugins/PluginLoader.ts 第 209 行发现可能暴露内部信息的错误处理
- **文件**: extension/plugins/PluginLoader.ts
- **行号**: 209
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/plugins/PluginManager.ts 第 141 行发现可能暴露内部信息的错误处理
- **文件**: extension/plugins/PluginManager.ts
- **行号**: 141
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/plugins/PluginManager.ts 第 204 行发现可能暴露内部信息的错误处理
- **文件**: extension/plugins/PluginManager.ts
- **行号**: 204
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/plugins/PluginManager.ts 第 263 行发现可能暴露内部信息的错误处理
- **文件**: extension/plugins/PluginManager.ts
- **行号**: 263
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/plugins/PluginManager.ts 第 305 行发现可能暴露内部信息的错误处理
- **文件**: extension/plugins/PluginManager.ts
- **行号**: 305
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/plugins/PluginManager.ts 第 624 行发现可能暴露内部信息的错误处理
- **文件**: extension/plugins/PluginManager.ts
- **行号**: 624
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/project/ProjectSerializer.ts 第 233 行发现可能暴露内部信息的错误处理
- **文件**: extension/project/ProjectSerializer.ts
- **行号**: 233
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/test-licensing.ts 第 186 行发现可能暴露内部信息的错误处理
- **文件**: extension/test-licensing.ts
- **行号**: 186
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/test-licensing.ts 第 212 行发现可能暴露内部信息的错误处理
- **文件**: extension/test-licensing.ts
- **行号**: 212
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/test-licensing.ts 第 57 行发现可能暴露内部信息的错误处理
- **文件**: extension/test-licensing.ts
- **行号**: 57
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 extension/webview/ProjectEditorProvider.ts 第 887 行发现可能暴露内部信息的错误处理
- **文件**: extension/webview/ProjectEditorProvider.ts
- **行号**: 887
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 shared/Checksum.ts 第 192 行发现可能暴露内部信息的错误处理
- **文件**: shared/Checksum.ts
- **行号**: 192
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 shared/FrameParser.ts 第 124 行发现可能暴露内部信息的错误处理
- **文件**: shared/FrameParser.ts
- **行号**: 124
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 shared/FrameParser.ts 第 181 行发现可能暴露内部信息的错误处理
- **文件**: shared/FrameParser.ts
- **行号**: 181
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 shared/FrameParser.ts 第 223 行发现可能暴露内部信息的错误处理
- **文件**: shared/FrameParser.ts
- **行号**: 223
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 shared/FrameParser.ts 第 251 行发现可能暴露内部信息的错误处理
- **文件**: shared/FrameParser.ts
- **行号**: 251
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 shared/FrameParser.ts 第 346 行发现可能暴露内部信息的错误处理
- **文件**: shared/FrameParser.ts
- **行号**: 346
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 shared/HighFrequencyRenderer.ts 第 389 行发现可能暴露内部信息的错误处理
- **文件**: shared/HighFrequencyRenderer.ts
- **行号**: 389
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 shared/MemoryManager.ts 第 418 行发现可能暴露内部信息的错误处理
- **文件**: shared/MemoryManager.ts
- **行号**: 418
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 shared/PerformanceMonitor.ts 第 552 行发现可能暴露内部信息的错误处理
- **文件**: shared/PerformanceMonitor.ts
- **行号**: 552
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 tests/export/ExportPerformanceBenchmark.test.ts 第 267 行发现可能暴露内部信息的错误处理
- **文件**: tests/export/ExportPerformanceBenchmark.test.ts
- **行号**: 267
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/components/dialogs/DataExportDialog.vue 第 561 行发现可能暴露内部信息的错误处理
- **文件**: webview/components/dialogs/DataExportDialog.vue
- **行号**: 561
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/components/dialogs/WidgetExportDialog.vue 第 383 行发现可能暴露内部信息的错误处理
- **文件**: webview/components/dialogs/WidgetExportDialog.vue
- **行号**: 383
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/components/dialogs/WidgetExportDialog.vue 第 492 行发现可能暴露内部信息的错误处理
- **文件**: webview/components/dialogs/WidgetExportDialog.vue
- **行号**: 492
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/components/dialogs/WidgetSettingsDialog.vue 第 451 行发现可能暴露内部信息的错误处理
- **文件**: webview/components/dialogs/WidgetSettingsDialog.vue
- **行号**: 451
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/components/widgets/AccelerometerWidget.vue 第 426 行发现可能暴露内部信息的错误处理
- **文件**: webview/components/widgets/AccelerometerWidget.vue
- **行号**: 426
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/components/widgets/BarWidget.vue 第 361 行发现可能暴露内部信息的错误处理
- **文件**: webview/components/widgets/BarWidget.vue
- **行号**: 361
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/components/widgets/BarWidget.vue 第 446 行发现可能暴露内部信息的错误处理
- **文件**: webview/components/widgets/BarWidget.vue
- **行号**: 446
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/components/widgets/CompassWidget.vue 第 388 行发现可能暴露内部信息的错误处理
- **文件**: webview/components/widgets/CompassWidget.vue
- **行号**: 388
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/components/widgets/DataGridWidget.vue 第 429 行发现可能暴露内部信息的错误处理
- **文件**: webview/components/widgets/DataGridWidget.vue
- **行号**: 429
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/components/widgets/GPSWidget.vue 第 253 行发现可能暴露内部信息的错误处理
- **文件**: webview/components/widgets/GPSWidget.vue
- **行号**: 253
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/components/widgets/GyroscopeWidget.vue 第 473 行发现可能暴露内部信息的错误处理
- **文件**: webview/components/widgets/GyroscopeWidget.vue
- **行号**: 473
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/components/widgets/LEDWidget.vue 第 388 行发现可能暴露内部信息的错误处理
- **文件**: webview/components/widgets/LEDWidget.vue
- **行号**: 388
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/components/widgets/Plot3DWidget.vue 第 304 行发现可能暴露内部信息的错误处理
- **文件**: webview/components/widgets/Plot3DWidget.vue
- **行号**: 304
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/components/widgets/PlotWidget.vue 第 374 行发现可能暴露内部信息的错误处理
- **文件**: webview/components/widgets/PlotWidget.vue
- **行号**: 374
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/components/widgets/PlotWidget.vue 第 455 行发现可能暴露内部信息的错误处理
- **文件**: webview/components/widgets/PlotWidget.vue
- **行号**: 455
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/components/widgets/TerminalWidget.vue 第 348 行发现可能暴露内部信息的错误处理
- **文件**: webview/components/widgets/TerminalWidget.vue
- **行号**: 348
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/composables/useI18n.ts 第 91 行发现可能暴露内部信息的错误处理
- **文件**: webview/composables/useI18n.ts
- **行号**: 91
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/i18n/I18nManager.ts 第 337 行发现可能暴露内部信息的错误处理
- **文件**: webview/i18n/I18nManager.ts
- **行号**: 337
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/i18n/I18nManager.ts 第 382 行发现可能暴露内部信息的错误处理
- **文件**: webview/i18n/I18nManager.ts
- **行号**: 382
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/i18n/I18nManager.ts 第 628 行发现可能暴露内部信息的错误处理
- **文件**: webview/i18n/I18nManager.ts
- **行号**: 628
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/i18n/I18nManager.ts 第 641 行发现可能暴露内部信息的错误处理
- **文件**: webview/i18n/I18nManager.ts
- **行号**: 641
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/i18n/I18nManager.ts 第 658 行发现可能暴露内部信息的错误处理
- **文件**: webview/i18n/I18nManager.ts
- **行号**: 658
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/i18n/I18nManager.ts 第 349 行发现可能暴露内部信息的错误处理
- **文件**: webview/i18n/I18nManager.ts
- **行号**: 349
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/main.ts 第 43 行发现可能暴露内部信息的错误处理
- **文件**: webview/main.ts
- **行号**: 43
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/stores/connection.ts 第 181 行发现可能暴露内部信息的错误处理
- **文件**: webview/stores/connection.ts
- **行号**: 181
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/stores/connection.ts 第 267 行发现可能暴露内部信息的错误处理
- **文件**: webview/stores/connection.ts
- **行号**: 267
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/stores/data.ts 第 154 行发现可能暴露内部信息的错误处理
- **文件**: webview/stores/data.ts
- **行号**: 154
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/stores/layout.ts 第 256 行发现可能暴露内部信息的错误处理
- **文件**: webview/stores/layout.ts
- **行号**: 256
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/stores/layout.ts 第 287 行发现可能暴露内部信息的错误处理
- **文件**: webview/stores/layout.ts
- **行号**: 287
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/stores/layout.ts 第 307 行发现可能暴露内部信息的错误处理
- **文件**: webview/stores/layout.ts
- **行号**: 307
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/stores/theme.ts 第 388 行发现可能暴露内部信息的错误处理
- **文件**: webview/stores/theme.ts
- **行号**: 388
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/stores/theme.ts 第 409 行发现可能暴露内部信息的错误处理
- **文件**: webview/stores/theme.ts
- **行号**: 409
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 290 行发现可能暴露内部信息的错误处理
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 290
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 309 行发现可能暴露内部信息的错误处理
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 309
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 454 行发现可能暴露内部信息的错误处理
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 454
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 491 行发现可能暴露内部信息的错误处理
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 491
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 523 行发现可能暴露内部信息的错误处理
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 523
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 541 行发现可能暴露内部信息的错误处理
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 541
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 550 行发现可能暴露内部信息的错误处理
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 550
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/tests/AdvancedVisualizationIntegrationTest.vue 第 571 行发现可能暴露内部信息的错误处理
- **文件**: webview/tests/AdvancedVisualizationIntegrationTest.vue
- **行号**: 571
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/tests/performance-benchmark.ts 第 261 行发现可能暴露内部信息的错误处理
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 261
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/tests/performance-benchmark.ts 第 452 行发现可能暴露内部信息的错误处理
- **文件**: webview/tests/performance-benchmark.ts
- **行号**: 452
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/tests/run-integration-tests.ts 第 808 行发现可能暴露内部信息的错误处理
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 808
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/tests/run-integration-tests.ts 第 253 行发现可能暴露内部信息的错误处理
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 253
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/tests/run-integration-tests.ts 第 267 行发现可能暴露内部信息的错误处理
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 267
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/tests/run-integration-tests.ts 第 783 行发现可能暴露内部信息的错误处理
- **文件**: webview/tests/run-integration-tests.ts
- **行号**: 783
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/utils/MessageBridge.ts 第 71 行发现可能暴露内部信息的错误处理
- **文件**: webview/utils/MessageBridge.ts
- **行号**: 71
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/utils/ThemeManager.ts 第 601 行发现可能暴露内部信息的错误处理
- **文件**: webview/utils/ThemeManager.ts
- **行号**: 601
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/utils/ThemeManager.ts 第 614 行发现可能暴露内部信息的错误处理
- **文件**: webview/utils/ThemeManager.ts
- **行号**: 614
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/utils/ThemeManager.ts 第 627 行发现可能暴露内部信息的错误处理
- **文件**: webview/utils/ThemeManager.ts
- **行号**: 627
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/utils/ThemeManager.ts 第 157 行发现可能暴露内部信息的错误处理
- **文件**: webview/utils/ThemeManager.ts
- **行号**: 157
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/utils/ThemeManager.ts 第 169 行发现可能暴露内部信息的错误处理
- **文件**: webview/utils/ThemeManager.ts
- **行号**: 169
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/utils/ThemeManager.ts 第 204 行发现可能暴露内部信息的错误处理
- **文件**: webview/utils/ThemeManager.ts
- **行号**: 204
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/utils/ThemeManager.ts 第 245 行发现可能暴露内部信息的错误处理
- **文件**: webview/utils/ThemeManager.ts
- **行号**: 245
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 webview/utils/ThemeManager.ts 第 259 行发现可能暴露内部信息的错误处理
- **文件**: webview/utils/ThemeManager.ts
- **行号**: 259
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### 🔵 可能泄露敏感信息的错误处理

- **级别**: LOW
- **类别**: Error Handling
- **描述**: 在 workers/DataProcessor.ts 第 107 行发现可能暴露内部信息的错误处理
- **文件**: workers/DataProcessor.ts
- **行号**: 107
- **CWE ID**: CWE-209
- **建议**: 确保错误信息不包含敏感的系统信息

### ℹ️ 使用了安全的JavaScript执行环境

- **级别**: INFO
- **类别**: Dependency Security
- **描述**: 项目使用了vm2，这是一个相对安全的JavaScript沙盒执行环境
- **建议**: 继续使用vm2，并保持更新到最新版本

## 安全建议

- 🚨 立即修复所有关键安全问题
- ⚠️ 优先修复高风险安全问题
- 📦 定期更新依赖项并进行安全扫描
- 🔍 加强输入验证和数据清理
- 🛡️ 实施安全的编码实践
- 🔒 实施定期安全审查流程
- 📚 为团队提供安全培训
- 🔧 集成自动化安全检测工具

## 修复优先级

1. **立即修复**: 🔴 关键和 🟡 高风险问题
2. **短期修复**: 🟠 中风险问题  
3. **长期改进**: 🔵 低风险问题和 ℹ️ 信息类问题

## 安全检查清单

- [ ] 所有关键和高风险问题已修复
- [ ] 依赖项已更新到最新安全版本
- [ ] 输入验证已实施
- [ ] 敏感信息已从代码中移除
- [ ] 错误处理不暴露内部信息
- [ ] 网络连接使用安全协议
- [ ] 文件权限设置合理
- [ ] 安全测试已通过

## 审查信息

- **审查时间**: 2025/7/29 21:25:12
- **审查范围**: 源代码、配置文件、依赖项
- **审查工具**: 自动化安全扫描

---
*此报告由自动化安全审查生成，建议结合手动安全测试*

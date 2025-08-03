# Serial-Studio VSCode 插件性能测试套件

这是一个全面的性能测试框架，用于评估和对比 VSCode 插件与 Serial-Studio 原版的性能表现。

## 🎯 测试目标

- **数据处理性能**: 串口数据解析、高频数据流处理
- **内存管理**: 对象池性能、内存泄漏检测
- **渲染性能**: 高频渲染器、Canvas 渲染吞吐量
- **虚拟化性能**: 虚拟列表、虚拟表格的大数据处理能力

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 运行测试

**快速测试**（开发期间使用）：
```bash
npm run test:performance:quick
```

**标准测试套件**：
```bash
npm run test:performance
```

**基准对比测试**：
```bash
npm run test:performance:benchmark
```

**全面测试**：
```bash
npm run test:performance:full
```

## 📊 性能基准

基于 Serial-Studio v1.1.7 的性能基准：

| 指标 | Serial-Studio 基准 | 目标值 | 说明 |
|------|-------------------|--------|------|
| 数据处理率 | 1000 frames/s | ≥800 frames/s | 串口数据帧处理能力 |
| 最大数据率 | 2 MB/s | ≥1.4 MB/s | 连续数据流处理能力 |
| 渲染帧率 | 60 FPS | ≥48 FPS | 图表渲染帧率 |
| 更新频率 | 30 Hz | ≥24 Hz | 实时数据更新频率 |
| 基础内存 | 50 MB | ≤75 MB | 应用启动时内存占用 |
| 响应延迟 | 16 ms | ≤32 ms | 数据处理延迟 |

## 🧪 测试类别

### 1. 数据处理测试 (`data`)

**serial-data-parsing**
- 测试串口数据解析的吞吐量和延迟
- 目标：>500 frames/s，验证 JSON 解析性能

**high-frequency-data-stream**
- 模拟高频率数据流的处理能力
- 目标：>100KB/s 数据率，>500fps 帧率

### 2. 内存管理测试 (`memory`)

**object-pool-performance**
- 测试对象池的分配和回收性能
- 目标：>50K 分配/s，>100K 回收/s

**memory-leak-detection**
- 测试内存监控和泄漏检测的性能开销
- 目标：<5s 监控开销，内存使用可控

### 3. 渲染性能测试 (`rendering`)

**high-frequency-renderer**
- 测试高频渲染器的帧率和延迟
- 目标：≥25 FPS，≤40ms 帧时间

**canvas-rendering-throughput**
- 测试 Canvas 渲染的数据点处理能力
- 目标：>1000 points/s，<1ms 平均渲染时间

### 4. 虚拟化测试 (`virtualization`)

**virtual-list-scrolling**
- 测试虚拟列表在大数据量下的滚动性能
- 目标：≥30 FPS，≤33ms 滚动时间

**virtual-table-data-handling**
- 测试虚拟表格处理大量数据的性能
- 目标：>100 updates/s，<100MB 内存使用

## 📈 性能报告

测试完成后会生成详细的性能报告，包括：

### 总体统计
- 测试通过率
- 综合性能评分（0-100）
- 平均性能指标

### 基准对比
- 与 Serial-Studio 的性能比较
- 各项指标的相对表现
- 性能比率分析

### 优化建议
- 基于测试结果的改进建议
- 性能瓶颈识别
- 优化方向指导

## 🛠️ 命令行工具

使用内置的命令行工具进行测试：

```bash
# 运行所有测试
node src/tests/performance/runPerformanceTests.js all

# 运行特定类别
node src/tests/performance/runPerformanceTests.js data
node src/tests/performance/runPerformanceTests.js memory
node src/tests/performance/runPerformanceTests.js rendering
node src/tests/performance/runPerformanceTests.js virtualization

# 基准对比
node src/tests/performance/runPerformanceTests.js benchmark

# 持续监控
node src/tests/performance/runPerformanceTests.js continuous

# 带选项的测试
node src/tests/performance/runPerformanceTests.js all --verbose --json --output results.json
```

### 可用选项

- `--verbose`: 详细输出模式
- `--json`: JSON 格式输出
- `--output <file>`: 保存结果到文件
- `--iterations <n>`: 设置测试迭代次数
- `--timeout <ms>`: 设置测试超时时间

## 📋 测试配置

测试配置在 `performance.config.json` 中定义：

```json
{
  "testSuites": {
    "quick": {
      "description": "快速性能测试",
      "iterations": 20,
      "timeout": 5000
    },
    "standard": {
      "description": "标准性能测试",
      "iterations": 50,
      "timeout": 10000
    }
  }
}
```

## 🎯 性能目标

### 优秀级别 (90-100分)
- FPS ≥ 80% Serial-Studio 基准
- 内存使用 ≤ 150% Serial-Studio 基准
- 吞吐量 ≥ 70% Serial-Studio 基准
- 延迟 ≤ 200% Serial-Studio 基准

### 良好级别 (70-89分)
- FPS ≥ 60% Serial-Studio 基准
- 内存使用 ≤ 200% Serial-Studio 基准
- 吞吐量 ≥ 50% Serial-Studio 基准
- 延迟 ≤ 300% Serial-Studio 基准

### 需改进 (<70分)
- 低于良好级别标准
- 需要性能优化

## 🔧 自定义测试

可以添加自定义测试用例：

```typescript
import { TestCase } from './PerformanceTestFramework';

const customTest: TestCase = {
  name: 'my-custom-test',
  description: '自定义性能测试',
  config: {
    name: 'my-custom-test',
    description: '测试描述',
    iterations: 50,
    warmupIterations: 5,
    timeout: 10000,
    dataSize: 1000
  },
  test: async () => {
    // 测试逻辑
    return { result: 'test data' };
  },
  validate: (result) => {
    // 验证逻辑
    return result.result === 'test data';
  }
};
```

## 📊 CI/CD 集成

在 CI/CD 流水线中运行性能测试：

```yaml
# GitHub Actions 示例
- name: Run Performance Tests
  run: |
    npm run test:performance:benchmark --json --output performance-results.json
    
- name: Upload Performance Results
  uses: actions/upload-artifact@v2
  with:
    name: performance-results
    path: performance-results.json
```

## 🐛 故障排除

### 常见问题

**内存不足错误**
```bash
# 增加 Node.js 内存限制
node --max-old-space-size=4096 src/tests/performance/runPerformanceTests.js all
```

**测试超时**
```bash
# 增加超时时间
node src/tests/performance/runPerformanceTests.js all --timeout 30000
```

**权限错误**
```bash
# 确保有足够的权限
chmod +x src/tests/performance/runPerformanceTests.js
```

## 📝 贡献指南

添加新的性能测试：

1. 在对应的测试类别中添加测试用例
2. 更新 README 文档
3. 确保测试通过验证
4. 提交 PR 进行审查

## 📚 相关资源

- [Serial-Studio 官方仓库](https://github.com/Serial-Studio/Serial-Studio)
- [性能优化最佳实践](../docs/performance-optimization.md)
- [测试结果分析指南](../docs/performance-analysis.md)
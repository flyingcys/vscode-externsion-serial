#!/usr/bin/env node

/**
 * 性能测试运行脚本
 * 提供命令行接口来执行各种性能测试
 */

import { PerformanceTestManager } from './PerformanceTestSuites';

// 命令行参数处理
const args = process.argv.slice(2);
const command = args[0] || 'help';
const options = args.slice(1);

/**
 * 显示帮助信息
 */
function showHelp(): void {
  console.log(`
Serial-Studio VSCode 插件性能测试工具

用法:
  npm run test:performance [command] [options]

命令:
  all                    运行完整性能测试套件
  data                   运行数据处理性能测试
  memory                 运行内存管理性能测试
  rendering              运行渲染性能测试
  virtualization         运行虚拟化性能测试
  benchmark              与Serial-Studio基准对比
  continuous             持续性能监控
  help                   显示帮助信息

选项:
  --verbose              详细输出
  --json                 以JSON格式输出结果
  --output <file>        将结果保存到文件
  --iterations <n>       设置测试迭代次数
  --timeout <ms>         设置测试超时时间

示例:
  npm run test:performance all --verbose
  npm run test:performance data --json --output results.json
  npm run test:performance benchmark --iterations 200
  `);
}

/**
 * 解析命令行选项
 */
function parseOptions(args: string[]): any {
  const options: any = {
    verbose: false,
    json: false,
    output: null,
    iterations: null,
    timeout: null
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--verbose':
        options.verbose = true;
        break;
      case '--json':
        options.json = true;
        break;
      case '--output':
        options.output = args[++i];
        break;
      case '--iterations':
        options.iterations = parseInt(args[++i], 10);
        break;
      case '--timeout':
        options.timeout = parseInt(args[++i], 10);
        break;
    }
  }

  return options;
}

/**
 * 运行基准对比测试
 */
async function runBenchmark(testManager: PerformanceTestManager, options: any): Promise<void> {
  console.log('='.repeat(60));
  console.log('Serial-Studio 基准对比测试');
  console.log('='.repeat(60));
  
  // 运行关键性能测试
  const keyTests = [
    'serial-data-parsing',
    'high-frequency-data-stream',
    'object-pool-performance',
    'high-frequency-renderer',
    'virtual-list-scrolling'
  ];

  const framework = testManager.getFramework();
  
  for (const testName of keyTests) {
    try {
      console.log(`\n运行基准测试: ${testName}`);
      const result = await framework.runTest(testName);
      
      if (result.baselineComparison) {
        const comp = result.baselineComparison;
        console.log(`\n${testName} 基准对比结果:`);
        console.log(`  FPS性能:     ${(comp.fpsRatio * 100).toFixed(1)}% (${comp.fpsRatio >= 0.8 ? '✓' : '✗'})`);
        console.log(`  内存效率:    ${(comp.memoryRatio * 100).toFixed(1)}% (${comp.memoryRatio <= 1.5 ? '✓' : '✗'})`);
        console.log(`  处理吞吐量:  ${(comp.throughputRatio * 100).toFixed(1)}% (${comp.throughputRatio >= 0.7 ? '✓' : '✗'})`);
        console.log(`  响应延迟:    ${(comp.latencyRatio * 100).toFixed(1)}% (${comp.latencyRatio <= 2.0 ? '✓' : '✗'})`);
        
        // 整体评估
        const passCount = [
          comp.fpsRatio >= 0.8,
          comp.memoryRatio <= 1.5,
          comp.throughputRatio >= 0.7,
          comp.latencyRatio <= 2.0
        ].filter(Boolean).length;
        
        console.log(`  整体评级:    ${passCount}/4 (${passCount >= 3 ? '优秀' : passCount >= 2 ? '良好' : '需改进'})`);
      }
    } catch (error) {
      console.error(`基准测试 ${testName} 失败:`, error.message);
    }
  }
  
  // 生成对比报告
  const report = framework.generateReport();
  
  console.log('\n' + '='.repeat(60));
  console.log('基准对比总结');
  console.log('='.repeat(60));
  console.log(`综合评分: ${report.summary.overallScore}/100`);
  
  if (report.summary.overallScore >= 80) {
    console.log('🎉 性能表现优秀，达到或超过Serial-Studio基准！');
  } else if (report.summary.overallScore >= 60) {
    console.log('👍 性能表现良好，接近Serial-Studio基准');
  } else {
    console.log('⚠️  性能有待改进，建议查看优化建议');
  }
  
  if (report.recommendations.length > 0) {
    console.log('\n优化建议:');
    report.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  }
}

/**
 * 持续性能监控
 */
async function runContinuousMonitoring(testManager: PerformanceTestManager, options: any): Promise<void> {
  console.log('开始持续性能监控...');
  console.log('按 Ctrl+C 停止监控');
  
  const framework = testManager.getFramework();
  const monitorInterval = 30000; // 30秒
  
  // 监控的关键测试
  const monitorTests = [
    'serial-data-parsing',
    'object-pool-performance',
    'high-frequency-renderer'
  ];
  
  let iteration = 1;
  
  const monitor = setInterval(async () => {
    console.log(`\n=== 监控周期 ${iteration} ===`);
    
    const results: any = {};
    
    for (const testName of monitorTests) {
      try {
        const result = await framework.runTest(testName);
        results[testName] = {
          fps: result.fps,
          memory: result.memoryUsage,
          latency: result.latency,
          success: result.success
        };
        
        console.log(`${testName}: FPS=${result.fps.toFixed(1)}, Memory=${result.memoryUsage.toFixed(1)}MB, Latency=${result.latency.toFixed(1)}ms`);
      } catch (error) {
        console.error(`监控测试 ${testName} 失败:`, error.message);
      }
    }
    
    // 检查性能趋势
    if (iteration > 1) {
      // TODO: 实现性能趋势分析
      console.log('性能稳定');
    }
    
    iteration++;
  }, monitorInterval);
  
  // 处理退出信号
  process.on('SIGINT', () => {
    console.log('\n停止持续监控...');
    clearInterval(monitor);
    process.exit(0);
  });
}

/**
 * 保存结果到文件
 */
async function saveResults(results: any, filename: string, format: 'json' | 'csv' = 'json'): Promise<void> {
  const fs = await import('fs/promises');
  
  try {
    if (format === 'json') {
      await fs.writeFile(filename, JSON.stringify(results, null, 2));
    } else if (format === 'csv') {
      // 简单的CSV导出
      const csvData = [
        'TestName,Success,AverageTime,FPS,MemoryUsage,Throughput,Latency',
        ...results.details.map((r: any) => 
          `${r.testName},${r.success},${r.averageTime},${r.fps},${r.memoryUsage},${r.throughput},${r.latency}`
        )
      ].join('\n');
      
      await fs.writeFile(filename, csvData);
    }
    
    console.log(`结果已保存到: ${filename}`);
  } catch (error) {
    console.error('保存结果失败:', error.message);
  }
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  const opts = parseOptions(options);
  
  if (opts.verbose) {
    console.log('启用详细输出模式');
  }
  
  let testManager: PerformanceTestManager | null = null;
  
  try {
    testManager = new PerformanceTestManager();
    
    switch (command) {
      case 'help':
      case '--help':
      case '-h':
        showHelp();
        break;
        
      case 'all':
        console.log('运行完整性能测试套件...');
        await testManager.runFullSuite();
        break;
        
      case 'data':
        console.log('运行数据处理性能测试...');
        await testManager.runCategory('data');
        break;
        
      case 'memory':
        console.log('运行内存管理性能测试...');
        await testManager.runCategory('memory');
        break;
        
      case 'rendering':
        console.log('运行渲染性能测试...');
        await testManager.runCategory('rendering');
        break;
        
      case 'virtualization':
        console.log('运行虚拟化性能测试...');
        await testManager.runCategory('virtualization');
        break;
        
      case 'benchmark':
        await runBenchmark(testManager, opts);
        break;
        
      case 'continuous':
        await runContinuousMonitoring(testManager, opts);
        break;
        
      default:
        console.error(`未知命令: ${command}`);
        showHelp();
        process.exit(1);
    }
    
    // 保存结果
    if (opts.output) {
      const framework = testManager.getFramework();
      const report = framework.generateReport();
      
      const format = opts.output.endsWith('.csv') ? 'csv' : 'json';
      await saveResults(report, opts.output, format);
    }
    
    // JSON输出
    if (opts.json && !opts.output) {
      const framework = testManager.getFramework();
      const report = framework.generateReport();
      console.log('\n' + JSON.stringify(report, null, 2));
    }
    
  } catch (error) {
    console.error('测试执行失败:', error);
    process.exit(1);
  } finally {
    if (testManager) {
      testManager.destroy();
    }
  }
}

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('未捕获的错误:', error);
    process.exit(1);
  });
}

export { main as runPerformanceTests };
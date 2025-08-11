#!/usr/bin/env node

/**
 * 测试质量监控系统
 * 实施持续改进机制，确保测试质量和真实源代码执行
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class TestQualityMonitor {
  constructor() {
    this.config = {
      // 覆盖率阈值
      coverageThresholds: {
        core: 80,        // 核心模块
        general: 60,     // 一般模块
        webview: 50,     // WebView组件
        plugins: 60,     // 插件系统
        workers: 70      // Workers模块
      },
      
      // 核心模块列表
      coreModules: [
        'src/extension/parsing',
        'src/extension/export',
        'src/extension/io',
        'src/shared'
      ],
      
      // 测试文件模式
      testPatterns: {
        redundant: [
          '*-Ultimate*.test.ts',
          '*-Enhanced*.test.ts',
          '*-Coverage-Boost*.test.ts',
          '*-100Percent*.test.ts',
          '*-Final*.test.ts',
          '*-Part2*.test.ts',
          '*-Optimized*.test.ts',
          '*-Production*.test.ts'
        ],
        preferred: [
          '*-Real.test.ts',
          '*.test.ts'
        ]
      }
    };
    
    this.reportData = {
      timestamp: new Date().toISOString(),
      testFiles: [],
      duplicates: [],
      coverage: {},
      realCodeExecution: {},
      recommendations: []
    };
  }

  /**
   * 执行完整的质量监控
   */
  async runFullMonitor() {
    console.log('🚀 开始测试质量监控...');
    
    try {
      // 1. 扫描测试文件
      await this.scanTestFiles();
      
      // 2. 检测冗余文件
      await this.detectRedundantFiles();
      
      // 3. 验证真实源代码执行
      await this.verifyRealCodeExecution();
      
      // 4. 生成质量报告
      await this.generateQualityReport();
      
      // 5. 提供改进建议
      await this.generateRecommendations();
      
      console.log('✅ 测试质量监控完成');
      
    } catch (error) {
      console.error('❌ 监控过程中出错:', error.message);
      throw error;
    }
  }

  /**
   * 扫描所有测试文件
   */
  async scanTestFiles() {
    console.log('📁 扫描测试文件...');
    
    const testDir = path.join(process.cwd(), 'utest');
    const testFiles = await this.findTestFiles(testDir);
    
    for (const filePath of testFiles) {
      const relativePath = path.relative(process.cwd(), filePath);
      const content = await fs.promises.readFile(filePath, 'utf-8');
      
      this.reportData.testFiles.push({
        path: relativePath,
        size: content.length,
        lines: content.split('\n').length,
        hasRealImport: this.checkRealImport(content),
        category: this.categorizeTest(relativePath)
      });
    }
    
    console.log(`📊 找到 ${testFiles.length} 个测试文件`);
  }

  /**
   * 查找所有测试文件
   */
  async findTestFiles(dir) {
    const files = [];
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...await this.findTestFiles(fullPath));
      } else if (entry.name.endsWith('.test.ts')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  /**
   * 检查测试文件是否导入真实源代码
   */
  checkRealImport(content) {
    const realImportPatterns = [
      /@extension\//,
      /@shared\//,
      /@webview\//,
      /@workers\//,
      /from\s+['"]\.\.\//,  // 相对路径导入
      /require\(['"]\.\.\//  // require相对路径
    ];
    
    return realImportPatterns.some(pattern => pattern.test(content));
  }

  /**
   * 分类测试文件
   */
  categorizeTest(filePath) {
    if (filePath.includes('/extension/')) return 'extension';
    if (filePath.includes('/webview/')) return 'webview';
    if (filePath.includes('/shared/')) return 'shared';
    if (filePath.includes('/workers/')) return 'workers';
    if (filePath.includes('/plugins/')) return 'plugins';
    return 'other';
  }

  /**
   * 检测冗余测试文件
   */
  async detectRedundantFiles() {
    console.log('🔍 检测冗余测试文件...');
    
    const fileGroups = {};
    
    // 按基础名称分组
    for (const testFile of this.reportData.testFiles) {
      const baseName = this.getBaseName(testFile.path);
      if (!fileGroups[baseName]) {
        fileGroups[baseName] = [];
      }
      fileGroups[baseName].push(testFile);
    }
    
    // 识别重复
    for (const [baseName, files] of Object.entries(fileGroups)) {
      if (files.length > 1) {
        this.reportData.duplicates.push({
          baseName,
          files: files.map(f => f.path),
          count: files.length,
          recommended: this.getRecommendedFile(files)
        });
      }
    }
    
    console.log(`⚠️  发现 ${this.reportData.duplicates.length} 组重复测试`);
  }

  /**
   * 获取测试文件基础名称
   */
  getBaseName(filePath) {
    const fileName = path.basename(filePath, '.test.ts');
    return fileName
      .replace(/-Real$/, '')
      .replace(/-Ultimate.*$/, '')
      .replace(/-Enhanced.*$/, '')
      .replace(/-Coverage-Boost.*$/, '')
      .replace(/-100Percent.*$/, '')
      .replace(/-Final.*$/, '')
      .replace(/-Part\d+$/, '')
      .replace(/-Optimized$/, '')
      .replace(/-Production$/, '')
      .replace(/-Simple$/, '')
      .replace(/-Fixed$/, '');
  }

  /**
   * 获取推荐保留的文件
   */
  getRecommendedFile(files) {
    // 优先级：Real > 基础文件 > 其他
    const realFile = files.find(f => f.path.includes('-Real.test.ts'));
    if (realFile) return realFile.path;
    
    const baseFile = files.find(f => !f.path.match(/-\w+\.test\.ts$/));
    if (baseFile) return baseFile.path;
    
    return files[0].path;
  }

  /**
   * 验证真实源代码执行
   */
  async verifyRealCodeExecution() {
    console.log('🔬 验证真实源代码执行...');
    
    const sampleTests = [
      'utest/extension/parsing/DataDecoder-Real.test.ts',
      'utest/extension/export/exporters/XMLExporter-Real.test.ts', 
      'utest/plugins/PluginManager-Real.test.ts',
      'utest/shared/MemoryManager-Real.test.ts'
    ];
    
    for (const testPath of sampleTests) {
      const fullPath = path.join(process.cwd(), testPath);
      if (await this.fileExists(fullPath)) {
        try {
          const result = await this.runSingleTest(testPath);
          this.reportData.realCodeExecution[testPath] = {
            executed: true,
            passed: result.passed,
            total: result.total,
            hasStackTrace: result.hasStackTrace,
            realCodePaths: result.realCodePaths
          };
        } catch (error) {
          this.reportData.realCodeExecution[testPath] = {
            executed: false,
            error: error.message
          };
        }
      }
    }
  }

  /**
   * 运行单个测试并分析输出
   */
  async runSingleTest(testPath) {
    try {
      const { stdout, stderr } = await execAsync(`cd utest && npx vitest run ${testPath} --reporter=verbose`);
      const output = stdout + stderr;
      
      // 分析输出
      const passedMatch = output.match(/(\d+) passed/);
      const totalMatch = output.match(/Tests\s+\d+\s+failed\s+\|\s+(\d+)\s+passed\s+\((\d+)\)/) || 
                        output.match(/Tests\s+(\d+)\s+passed/);
      
      const realCodePaths = this.extractRealCodePaths(output);
      
      return {
        passed: passedMatch ? parseInt(passedMatch[1]) : 0,
        total: totalMatch ? parseInt(totalMatch[totalMatch.length - 1]) : 0,
        hasStackTrace: output.includes('/src/') && output.includes('.ts:'),
        realCodePaths
      };
    } catch (error) {
      // 即使有错误，也可能执行了真实代码
      const output = error.stdout + error.stderr;
      const realCodePaths = this.extractRealCodePaths(output);
      
      return {
        passed: 0,
        total: 0,
        hasStackTrace: output.includes('/src/') && output.includes('.ts:'),
        realCodePaths,
        error: error.message
      };
    }
  }

  /**
   * 从输出中提取真实源代码路径
   */
  extractRealCodePaths(output) {
    const pathRegex = /\/src\/[^:]+\.ts:\d+/g;
    const matches = output.match(pathRegex) || [];
    return [...new Set(matches)]; // 去重
  }

  /**
   * 检查文件是否存在
   */
  async fileExists(filePath) {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 生成质量报告
   */
  async generateQualityReport() {
    console.log('📋 生成质量报告...');
    
    const report = {
      timestamp: this.reportData.timestamp,
      summary: {
        totalTestFiles: this.reportData.testFiles.length,
        duplicateGroups: this.reportData.duplicates.length,
        realCodeExecutionTests: Object.keys(this.reportData.realCodeExecution).length,
        realCodeExecutionSuccess: Object.values(this.reportData.realCodeExecution)
          .filter(r => r.executed && r.hasStackTrace).length
      },
      testFilesBreakdown: this.getTestFilesBreakdown(),
      duplicateAnalysis: this.reportData.duplicates,
      realCodeExecutionResults: this.reportData.realCodeExecution,
      recommendations: this.reportData.recommendations
    };
    
    // 写入报告文件
    const reportPath = `coverage-monitor-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    await fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    // 生成Markdown报告
    await this.generateMarkdownReport(report, reportPath);
    
    console.log(`📄 报告已生成: ${reportPath}`);
  }

  /**
   * 获取测试文件分布统计
   */
  getTestFilesBreakdown() {
    const breakdown = {};
    for (const testFile of this.reportData.testFiles) {
      const category = testFile.category;
      if (!breakdown[category]) {
        breakdown[category] = { count: 0, hasRealImport: 0 };
      }
      breakdown[category].count++;
      if (testFile.hasRealImport) {
        breakdown[category].hasRealImport++;
      }
    }
    return breakdown;
  }

  /**
   * 生成Markdown格式报告
   */
  async generateMarkdownReport(data, jsonPath) {
    const mdPath = jsonPath.replace('.json', '.md');
    
    const markdown = `
# 测试质量监控报告

*生成时间: ${data.timestamp}*

## 📊 总体统计

- **测试文件总数**: ${data.summary.totalTestFiles}
- **重复文件组数**: ${data.summary.duplicateGroups}
- **真实代码执行验证**: ${data.summary.realCodeExecutionSuccess}/${data.summary.realCodeExecutionTests}

## 📁 测试文件分布

${Object.entries(data.testFilesBreakdown).map(([category, stats]) => 
  `- **${category}**: ${stats.count} 个文件, ${stats.hasRealImport} 个导入真实源代码`
).join('\n')}

## ⚠️ 重复文件分析

${data.duplicateAnalysis.length === 0 ? '✅ 未发现重复文件组' : 
  data.duplicateAnalysis.map(dup => 
    `### ${dup.baseName}\n- 文件数量: ${dup.count}\n- 推荐保留: \`${dup.recommended}\`\n- 可删除: ${dup.files.filter(f => f !== dup.recommended).map(f => `\`${f}\``).join(', ')}`
  ).join('\n\n')
}

## 🔬 真实源代码执行验证

${Object.entries(data.realCodeExecutionResults).map(([testPath, result]) => {
  const status = result.executed && result.hasStackTrace ? '✅' : '❌';
  return `### ${status} ${testPath}\n- 执行状态: ${result.executed ? '成功' : '失败'}\n- 通过/总计: ${result.passed || 0}/${result.total || 0}\n- 真实代码调用: ${result.hasStackTrace ? '是' : '否'}\n${result.realCodePaths ? `- 调用路径: ${result.realCodePaths.slice(0, 3).join(', ')}` : ''}`;
}).join('\n\n')}

## 💡 改进建议

${data.recommendations.length === 0 ? '当前测试体系运行良好' : 
  data.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')
}

---
*报告数据: [${jsonPath}](./${path.basename(jsonPath)})*
`;

    await fs.promises.writeFile(mdPath, markdown.trim());
    console.log(`📄 Markdown报告: ${mdPath}`);
  }

  /**
   * 生成改进建议
   */
  async generateRecommendations() {
    console.log('💡 生成改进建议...');
    
    const recs = this.reportData.recommendations;
    
    // 基于重复文件的建议
    if (this.reportData.duplicates.length > 0) {
      recs.push(`发现 ${this.reportData.duplicates.length} 组重复测试文件，建议删除冗余版本`);
      
      const totalRedundant = this.reportData.duplicates.reduce((sum, dup) => 
        sum + (dup.files.length - 1), 0);
      recs.push(`可通过删除 ${totalRedundant} 个冗余文件减少维护负担`);
    }
    
    // 基于真实代码执行的建议
    const realCodeTests = Object.values(this.reportData.realCodeExecution);
    const successfulRealCodeTests = realCodeTests.filter(r => r.executed && r.hasStackTrace);
    
    if (successfulRealCodeTests.length < realCodeTests.length) {
      recs.push('部分测试未能验证真实源代码执行，建议检查测试环境配置');
    }
    
    // 基于文件分布的建议
    const breakdown = this.getTestFilesBreakdown();
    for (const [category, stats] of Object.entries(breakdown)) {
      const realImportRatio = stats.hasRealImport / stats.count;
      if (realImportRatio < 0.8) {
        recs.push(`${category} 模块中 ${(realImportRatio * 100).toFixed(0)}% 的测试导入真实源代码，建议提高比例`);
      }
    }
    
    console.log(`💡 生成了 ${recs.length} 条改进建议`);
  }
}

// 主执行函数
async function main() {
  const monitor = new TestQualityMonitor();
  
  try {
    await monitor.runFullMonitor();
    console.log('🎉 测试质量监控系统运行完成');
    process.exit(0);
  } catch (error) {
    console.error('💥 监控系统运行失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = TestQualityMonitor;
#!/usr/bin/env node

/**
 * Plugins 模块覆盖率检查脚本
 * 
 * 确保 Plugins 模块达到 100% 覆盖率标准
 * 提供详细的覆盖率分析和报告
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 覆盖率阈值配置
const COVERAGE_THRESHOLDS = {
  lines: 100,
  branches: 100,
  functions: 100,
  statements: 100
};

// Plugins 模块文件列表
const PLUGINS_FILES = [
  'src/extension/plugins/index.ts',
  'src/extension/plugins/types.ts',
  'src/extension/plugins/PluginManager.ts',
  'src/extension/plugins/PluginLoader.ts',
  'src/extension/plugins/ContributionRegistry.ts',
  'src/extension/plugins/PluginContext.ts'
];

/**
 * 颜色输出工具
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

/**
 * 运行覆盖率测试
 */
function runCoverageTest() {
  console.log(colorize('\n🧪 Running Plugins Module Coverage Test...', 'cyan'));
  
  try {
    // 运行 Plugins 模块特定的测试
    const testCommand = 'npx vitest run utest/plugins/ --coverage --reporter=verbose';
    console.log(colorize(`执行命令: ${testCommand}`, 'blue'));
    
    const result = execSync(testCommand, {
      stdio: 'pipe',
      encoding: 'utf8',
      cwd: process.cwd()
    });
    
    console.log(result);
    return true;
  } catch (error) {
    console.error(colorize('测试执行失败:', 'red'), error.message);
    return false;
  }
}

/**
 * 解析覆盖率报告
 */
function parseCoverageReport() {
  const coverageFile = path.join(process.cwd(), 'coverage', 'coverage-final.json');
  
  if (!fs.existsSync(coverageFile)) {
    console.error(colorize('覆盖率报告文件不存在:', 'red'), coverageFile);
    return null;
  }
  
  try {
    const coverageData = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
    return coverageData;
  } catch (error) {
    console.error(colorize('解析覆盖率报告失败:', 'red'), error.message);
    return null;
  }
}

/**
 * 分析 Plugins 模块覆盖率
 */
function analyzePluginsCoverage(coverageData) {
  console.log(colorize('\n📊 Plugins Module Coverage Analysis', 'magenta'));
  console.log('='.repeat(50));
  
  const pluginsCoverage = {};
  let totalLines = 0;
  let coveredLines = 0;
  let totalBranches = 0;
  let coveredBranches = 0;
  let totalFunctions = 0;
  let coveredFunctions = 0;
  let totalStatements = 0;
  let coveredStatements = 0;
  
  // 分析每个文件的覆盖率
  PLUGINS_FILES.forEach(file => {
    const filePath = path.resolve(file);
    const coverage = coverageData[filePath];
    
    if (!coverage) {
      console.warn(colorize(`⚠️  未找到文件覆盖率数据: ${file}`, 'yellow'));
      return;
    }
    
    const lineCoverage = calculateLineCoverage(coverage.s, coverage.statementMap);
    const branchCoverage = calculateBranchCoverage(coverage.b, coverage.branchMap);
    const functionCoverage = calculateFunctionCoverage(coverage.f, coverage.fnMap);
    const statementCoverage = calculateStatementCoverage(coverage.s);
    
    pluginsCoverage[file] = {
      lines: lineCoverage,
      branches: branchCoverage,
      functions: functionCoverage,
      statements: statementCoverage
    };
    
    // 累计统计
    totalLines += lineCoverage.total;
    coveredLines += lineCoverage.covered;
    totalBranches += branchCoverage.total;
    coveredBranches += branchCoverage.covered;
    totalFunctions += functionCoverage.total;
    coveredFunctions += functionCoverage.covered;
    totalStatements += statementCoverage.total;
    coveredStatements += statementCoverage.covered;
    
    // 显示单个文件覆盖率
    displayFileCoverage(file, pluginsCoverage[file]);
  });
  
  // 计算总体覆盖率
  const overallCoverage = {
    lines: { covered: coveredLines, total: totalLines, percentage: (coveredLines / totalLines * 100) },
    branches: { covered: coveredBranches, total: totalBranches, percentage: (coveredBranches / totalBranches * 100) },
    functions: { covered: coveredFunctions, total: totalFunctions, percentage: (coveredFunctions / totalFunctions * 100) },
    statements: { covered: coveredStatements, total: totalStatements, percentage: (coveredStatements / totalStatements * 100) }
  };
  
  displayOverallCoverage(overallCoverage);
  
  return { pluginsCoverage, overallCoverage };
}

/**
 * 计算行覆盖率
 */
function calculateLineCoverage(statements, statementMap) {
  const lines = new Set();
  const coveredLines = new Set();
  
  Object.keys(statementMap).forEach(key => {
    const statement = statementMap[key];
    const startLine = statement.start.line;
    lines.add(startLine);
    
    if (statements[key] > 0) {
      coveredLines.add(startLine);
    }
  });
  
  return {
    covered: coveredLines.size,
    total: lines.size,
    percentage: lines.size > 0 ? (coveredLines.size / lines.size * 100) : 100
  };
}

/**
 * 计算分支覆盖率
 */
function calculateBranchCoverage(branches, branchMap) {
  let totalBranches = 0;
  let coveredBranches = 0;
  
  Object.keys(branchMap).forEach(key => {
    const branch = branches[key];
    if (branch) {
      totalBranches += branch.length;
      coveredBranches += branch.filter(b => b > 0).length;
    }
  });
  
  return {
    covered: coveredBranches,
    total: totalBranches,
    percentage: totalBranches > 0 ? (coveredBranches / totalBranches * 100) : 100
  };
}

/**
 * 计算函数覆盖率
 */
function calculateFunctionCoverage(functions, functionMap) {
  const totalFunctions = Object.keys(functionMap).length;
  const coveredFunctions = Object.keys(functions).filter(key => functions[key] > 0).length;
  
  return {
    covered: coveredFunctions,
    total: totalFunctions,
    percentage: totalFunctions > 0 ? (coveredFunctions / totalFunctions * 100) : 100
  };
}

/**
 * 计算语句覆盖率
 */
function calculateStatementCoverage(statements) {
  const totalStatements = Object.keys(statements).length;
  const coveredStatements = Object.keys(statements).filter(key => statements[key] > 0).length;
  
  return {
    covered: coveredStatements,
    total: totalStatements,
    percentage: totalStatements > 0 ? (coveredStatements / totalStatements * 100) : 100
  };
}

/**
 * 显示单个文件覆盖率
 */
function displayFileCoverage(file, coverage) {
  const fileName = path.basename(file);
  console.log(colorize(`\n📄 ${fileName}`, 'bright'));
  
  const metrics = ['lines', 'branches', 'functions', 'statements'];
  metrics.forEach(metric => {
    const data = coverage[metric];
    const percentage = data.percentage.toFixed(2);
    const color = percentage >= COVERAGE_THRESHOLDS[metric] ? 'green' : 'red';
    const status = percentage >= COVERAGE_THRESHOLDS[metric] ? '✅' : '❌';
    
    console.log(`  ${status} ${metric.padEnd(12)}: ${colorize(percentage + '%', color)} (${data.covered}/${data.total})`);
  });
}

/**
 * 显示总体覆盖率
 */
function displayOverallCoverage(overallCoverage) {
  console.log(colorize('\n🎯 Overall Plugins Module Coverage', 'bright'));
  console.log('='.repeat(50));
  
  const metrics = ['lines', 'branches', 'functions', 'statements'];
  let allPassed = true;
  
  metrics.forEach(metric => {
    const data = overallCoverage[metric];
    const percentage = data.percentage.toFixed(2);
    const color = percentage >= COVERAGE_THRESHOLDS[metric] ? 'green' : 'red';
    const status = percentage >= COVERAGE_THRESHOLDS[metric] ? '✅' : '❌';
    
    if (percentage < COVERAGE_THRESHOLDS[metric]) {
      allPassed = false;
    }
    
    console.log(`${status} ${metric.padEnd(12)}: ${colorize(percentage + '%', color)} (${data.covered}/${data.total})`);
  });
  
  return allPassed;
}

/**
 * 生成覆盖率改进建议
 */
function generateImprovementSuggestions(pluginsCoverage) {
  console.log(colorize('\n💡 Coverage Improvement Suggestions', 'yellow'));
  console.log('='.repeat(50));
  
  const suggestions = [];
  
  Object.keys(pluginsCoverage).forEach(file => {
    const coverage = pluginsCoverage[file];
    const fileName = path.basename(file);
    
    Object.keys(coverage).forEach(metric => {
      const data = coverage[metric];
      if (data.percentage < COVERAGE_THRESHOLDS[metric]) {
        const missing = data.total - data.covered;
        suggestions.push({
          file: fileName,
          metric,
          percentage: data.percentage.toFixed(2),
          missing,
          priority: 100 - data.percentage
        });
      }
    });
  });
  
  // 按优先级排序
  suggestions.sort((a, b) => b.priority - a.priority);
  
  if (suggestions.length === 0) {
    console.log(colorize('🎉 所有文件都达到了100%覆盖率标准！', 'green'));
  } else {
    suggestions.slice(0, 10).forEach((suggestion, index) => {
      console.log(`${index + 1}. ${suggestion.file} - ${suggestion.metric}: ${suggestion.percentage}% (缺少 ${suggestion.missing} 项)`);
    });
  }
}

/**
 * 主函数
 */
function main() {
  console.log(colorize('🎯 Plugins Module Coverage Check Tool', 'bright'));
  console.log(colorize('目标: 100% 代码覆盖率', 'cyan'));
  
  // 步骤1: 运行覆盖率测试
  const testPassed = runCoverageTest();
  if (!testPassed) {
    process.exit(1);
  }
  
  // 步骤2: 解析覆盖率报告
  const coverageData = parseCoverageReport();
  if (!coverageData) {
    process.exit(1);
  }
  
  // 步骤3: 分析 Plugins 模块覆盖率
  const analysisResult = analyzePluginsCoverage(coverageData);
  if (!analysisResult) {
    process.exit(1);
  }
  
  const { pluginsCoverage, overallCoverage } = analysisResult;
  
  // 步骤4: 生成改进建议
  generateImprovementSuggestions(pluginsCoverage);
  
  // 步骤5: 检查是否通过标准
  const allMetricsPassed = displayOverallCoverage(overallCoverage);
  
  if (allMetricsPassed) {
    console.log(colorize('\n🎉 Plugins 模块已达到 100% 覆盖率标准！', 'green'));
    process.exit(0);
  } else {
    console.log(colorize('\n❌ Plugins 模块未达到 100% 覆盖率标准', 'red'));
    console.log(colorize('请根据上述建议改进测试覆盖率', 'yellow'));
    process.exit(1);
  }
}

// 如果直接运行该脚本
if (require.main === module) {
  main();
}

module.exports = {
  runCoverageTest,
  parseCoverageReport,
  analyzePluginsCoverage,
  displayOverallCoverage,
  generateImprovementSuggestions
};
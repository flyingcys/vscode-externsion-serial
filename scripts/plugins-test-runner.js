#!/usr/bin/env node

/**
 * Plugins 模块测试运行器
 * 
 * 提供完整的 Plugins 模块测试流程
 * 包括单元测试、覆盖率检查、性能测试和质量验证
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// 颜色输出
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

function log(message, color = 'reset') {
  console.log(colorize(message, color));
}

function logStep(step, message) {
  log(`\n🔸 Step ${step}: ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

/**
 * 执行命令并处理结果
 */
function runCommand(command, description, options = {}) {
  const { ignoreError = false, silent = false } = options;
  
  if (!silent) {
    log(`执行: ${command}`, 'blue');
  }
  
  try {
    const result = execSync(command, {
      stdio: silent ? 'pipe' : 'inherit',
      encoding: 'utf8',
      cwd: process.cwd(),
      ...options
    });
    
    if (!silent) {
      logSuccess(`${description} 完成`);
    }
    
    return { success: true, output: result };
  } catch (error) {
    if (ignoreError) {
      logWarning(`${description} 执行时出现警告: ${error.message}`);
      return { success: false, error: error.message, output: error.stdout };
    } else {
      logError(`${description} 失败: ${error.message}`);
      throw error;
    }
  }
}

/**
 * 检查测试环境
 */
function checkTestEnvironment() {
  logStep(1, '检查测试环境');
  
  // 检查 Node.js 版本
  const nodeVersion = process.version;
  log(`Node.js 版本: ${nodeVersion}`);
  
  // 检查必要的目录
  const requiredDirs = [
    'utest',
    'utest/plugins',
    'utest/mocks',
    'utest/test-utils',
    'utest/config',
    'utest/scripts'
  ];
  
  requiredDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      logError(`必要目录不存在: ${dir}`);
      process.exit(1);
    }
  });
  
  // 检查配置文件
  const configFile = 'utest/config/plugins-test.config.mjs';
  if (!fs.existsSync(configFile)) {
    logError(`配置文件不存在: ${configFile}`);
    process.exit(1);
  }
  
  logSuccess('测试环境检查通过');
}

/**
 * 运行类型检查
 */
function runTypeCheck() {
  logStep(2, '运行 TypeScript 类型检查');
  
  runCommand(
    'npx tsc --noEmit --project tsconfig.json',
    'TypeScript 类型检查'
  );
}

/**
 * 运行 ESLint 检查
 */
function runLintCheck() {
  logStep(3, '运行 ESLint 代码检查');
  
  runCommand(
    'npx eslint src/extension/plugins/**/*.ts --ext .ts',
    'ESLint 代码检查'
  );
}

/**
 * 运行 Plugins 模块单元测试
 */
function runUnitTests() {
  logStep(4, '运行 Plugins 模块单元测试');
  
  const testCommand = 'npx vitest run --config utest/config/plugins-test.config.mjs';
  
  runCommand(testCommand, 'Plugins 模块单元测试');
}

/**
 * 运行覆盖率测试
 */
function runCoverageTests() {
  logStep(5, '运行覆盖率测试');
  
  const coverageCommand = 'npx vitest run --config utest/config/plugins-test.config.mjs --coverage';
  
  runCommand(coverageCommand, 'Plugins 模块覆盖率测试');
}

/**
 * 验证覆盖率标准
 */
function verifyCoverageStandards() {
  logStep(6, '验证覆盖率标准');
  
  const coverageCheckScript = path.join(__dirname, '../utest/scripts/plugins-coverage-check.js');
  
  runCommand(
    `node "${coverageCheckScript}"`,
    '覆盖率标准验证'
  );
}

/**
 * 运行性能测试
 */
function runPerformanceTests() {
  logStep(7, '运行性能测试');
  
  const perfCommand = 'npx vitest run utest/plugins/**/*.bench.ts --config utest/config/plugins-test.config.mjs';
  
  runCommand(
    perfCommand,
    'Plugins 模块性能测试',
    { ignoreError: true }
  );
}

/**
 * 生成测试报告
 */
function generateTestReport() {
  logStep(8, '生成测试报告');
  
  // 创建报告目录
  const reportDir = 'utest/results';
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  // 生成 HTML 覆盖率报告
  const htmlReportPath = path.join(reportDir, 'plugins-coverage-report.html');
  if (fs.existsSync('coverage/index.html')) {
    runCommand(
      `cp coverage/index.html "${htmlReportPath}"`,
      '复制覆盖率报告',
      { silent: true }
    );
  }
  
  logSuccess(`测试报告已生成到 ${reportDir}`);
}

/**
 * 清理测试环境
 */
function cleanupTestEnvironment() {
  logStep(9, '清理测试环境');
  
  const cleanupDirs = [
    'coverage',
    'node_modules/.vitest'
  ];
  
  cleanupDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      runCommand(
        `rm -rf "${dir}"`,
        `清理 ${dir}`,
        { silent: true, ignoreError: true }
      );
    }
  });
  
  logSuccess('测试环境清理完成');
}

/**
 * 显示测试结果摘要
 */
function showTestSummary() {
  log('\n' + '='.repeat(60), 'bright');
  log('🎯 Plugins Module Test Summary', 'bright');
  log('='.repeat(60), 'bright');
  
  // 读取覆盖率结果
  try {
    const coverageFile = 'coverage/coverage-final.json';
    if (fs.existsSync(coverageFile)) {
      const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
      const pluginFiles = Object.keys(coverage).filter(file => 
        file.includes('src/extension/plugins/')
      );
      
      log(`📊 Plugins 模块文件数: ${pluginFiles.length}`, 'cyan');
      log(`📈 覆盖率报告: coverage/index.html`, 'cyan');
    }
  } catch (error) {
    logWarning('无法读取覆盖率摘要');
  }
  
  // 显示测试报告位置
  log('📑 测试报告目录: utest/results/', 'cyan');
  
  log('\n✨ Plugins 模块测试完成！', 'green');
}

/**
 * 主函数
 */
async function main() {
  const startTime = Date.now();
  
  log('🚀 Starting Plugins Module Test Suite', 'bright');
  log('Target: 100% Coverage & 100% Pass Rate', 'cyan');
  
  try {
    checkTestEnvironment();
    runTypeCheck();
    runLintCheck();
    runUnitTests();
    runCoverageTests();
    verifyCoverageStandards();
    runPerformanceTests();
    generateTestReport();
    showTestSummary();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    log(`\n🎉 所有测试通过！总耗时: ${duration}秒`, 'green');
    process.exit(0);
    
  } catch (error) {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    logError(`\n💥 测试失败！总耗时: ${duration}秒`);
    logError(`错误详情: ${error.message}`);
    
    process.exit(1);
  } finally {
    cleanupTestEnvironment();
  }
}

// 处理命令行参数
const args = process.argv.slice(2);
const options = {
  skipTypeCheck: args.includes('--skip-type-check'),
  skipLint: args.includes('--skip-lint'),
  skipPerf: args.includes('--skip-perf'),
  verbose: args.includes('--verbose'),
  coverage: !args.includes('--no-coverage')
};

if (args.includes('--help')) {
  console.log(`
Plugins Module Test Runner

Usage: node scripts/plugins-test-runner.js [options]

Options:
  --skip-type-check    Skip TypeScript type checking
  --skip-lint          Skip ESLint checking  
  --skip-perf          Skip performance tests
  --no-coverage        Skip coverage tests
  --verbose            Verbose output
  --help               Show this help message
  `);
  process.exit(0);
}

// 根据选项调整执行流程
if (options.skipTypeCheck) {
  log('⏭️  跳过类型检查', 'yellow');
}
if (options.skipLint) {
  log('⏭️  跳过代码检查', 'yellow');
}
if (options.skipPerf) {
  log('⏭️  跳过性能测试', 'yellow');
}

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    logError(`未处理的错误: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  checkTestEnvironment,
  runTypeCheck,
  runLintCheck,
  runUnitTests,
  runCoverageTests,
  verifyCoverageStandards,
  runPerformanceTests,
  generateTestReport,
  cleanupTestEnvironment,
  showTestSummary
};
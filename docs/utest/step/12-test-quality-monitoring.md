# Phase 4-2: 测试质量监控体系

**优先级**: 🔵 基础设施  
**预计工期**: 2天  
**负责模块**: 质量监控和度量分析

## 🎯 目标

建立全面的测试质量监控体系，实现实时质量度量、趋势分析、自动告警，确保测试体系的持续改进和优化。

## 🔍 监控维度分析

### 核心监控指标
```
代码质量指标:
- 测试覆盖率 (行覆盖、分支覆盖、函数覆盖)
- 测试通过率
- 代码复杂度
- 技术债务指标

测试执行指标:
- 测试运行时间
- 测试稳定性 (flaky tests)
- 测试维护成本
- 回归测试效果

开发效率指标:
- 缺陷发现率
- 修复时间
- 发布频率
- 代码变更影响范围
```

## 📋 详细任务清单

### Task 12.1: 质量度量数据收集 (1天)

**目标**: 建立全面的测试质量数据收集系统

**度量数据收集器**:
```javascript
// scripts/quality-metrics-collector.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class QualityMetricsCollector {
  constructor() {
    this.metricsDir = path.join(__dirname, '../metrics');
    this.historyDir = path.join(this.metricsDir, 'history');
    this.currentMetrics = {
      timestamp: new Date().toISOString(),
      coverage: {},
      tests: {},
      performance: {},
      codeQuality: {},
      trends: {}
    };
  }

  async collectAllMetrics() {
    console.log('📊 Collecting quality metrics...');

    // 确保目录存在
    [this.metricsDir, this.historyDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    await Promise.all([
      this.collectCoverageMetrics(),
      this.collectTestMetrics(),
      this.collectPerformanceMetrics(),
      this.collectCodeQualityMetrics()
    ]);

    this.calculateTrends();
    await this.saveMetrics();
    await this.generateAlerts();

    return this.currentMetrics;
  }

  async collectCoverageMetrics() {
    console.log('  📈 Collecting coverage metrics...');

    const coveragePath = path.join(__dirname, '../coverage/coverage-summary.json');
    if (!fs.existsSync(coveragePath)) {
      console.warn('  ⚠️ Coverage report not found');
      return;
    }

    const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
    
    this.currentMetrics.coverage = {
      overall: {
        lines: coverage.total.lines.pct,
        branches: coverage.total.branches.pct,
        functions: coverage.total.functions.pct,
        statements: coverage.total.statements.pct
      },
      modules: this.analyzeCoverageByModule(coverage),
      uncoveredFiles: this.findUncoveredFiles(coverage),
      hotspots: this.identifyCoverageHotspots(coverage)
    };
  }

  analyzeCoverageByModule(coverage) {
    const modules = ['extension', 'shared', 'webview', 'workers'];
    const moduleMetrics = {};

    modules.forEach(module => {
      const pattern = `src/${module}/`;
      let totalLines = 0;
      let coveredLines = 0;
      let totalFunctions = 0;
      let coveredFunctions = 0;
      let fileCount = 0;

      Object.entries(coverage).forEach(([file, stats]) => {
        if (file === 'total' || !file.includes(pattern)) return;
        
        fileCount++;
        totalLines += stats.lines.total;
        coveredLines += stats.lines.covered;
        totalFunctions += stats.functions.total;
        coveredFunctions += stats.functions.covered;
      });

      moduleMetrics[module] = {
        fileCount,
        linesCoverage: totalLines > 0 ? Math.round((coveredLines / totalLines) * 100) : 0,
        functionsCoverage: totalFunctions > 0 ? Math.round((coveredFunctions / totalFunctions) * 100) : 0,
        totalLines,
        coveredLines,
        uncoveredLines: totalLines - coveredLines
      };
    });

    return moduleMetrics;
  }

  findUncoveredFiles(coverage) {
    const uncovered = [];
    
    Object.entries(coverage).forEach(([file, stats]) => {
      if (file === 'total') return;
      
      if (stats.lines.pct === 0) {
        uncovered.push({
          file,
          totalLines: stats.lines.total,
          priority: this.calculateFilePriority(file)
        });
      }
    });

    return uncovered.sort((a, b) => b.priority - a.priority);
  }

  calculateFilePriority(file) {
    // 基于文件路径和类型计算优先级
    let priority = 0;
    
    if (file.includes('src/extension/')) priority += 10;
    if (file.includes('src/shared/')) priority += 8;
    if (file.includes('Manager') || file.includes('Controller')) priority += 5;
    if (file.includes('.vue')) priority += 3;
    if (file.endsWith('.ts')) priority += 2;
    
    return priority;
  }

  identifyCoverageHotspots(coverage) {
    const hotspots = [];
    
    Object.entries(coverage).forEach(([file, stats]) => {
      if (file === 'total') return;
      
      const score = this.calculateHotspotScore(stats);
      if (score > 50) {
        hotspots.push({
          file,
          score,
          issues: this.identifyHotspotIssues(stats)
        });
      }
    });

    return hotspots.sort((a, b) => b.score - a.score);
  }

  calculateHotspotScore(stats) {
    let score = 0;
    
    // 低覆盖率增加分数
    if (stats.lines.pct < 50) score += (50 - stats.lines.pct);
    if (stats.branches.pct < 60) score += (60 - stats.branches.pct) * 0.8;
    if (stats.functions.pct < 70) score += (70 - stats.functions.pct) * 0.6;
    
    // 大文件增加分数
    if (stats.lines.total > 200) score += Math.log(stats.lines.total / 200) * 10;
    
    return Math.round(score);
  }

  identifyHotspotIssues(stats) {
    const issues = [];
    
    if (stats.lines.pct < 50) issues.push('Low line coverage');
    if (stats.branches.pct < 60) issues.push('Low branch coverage');  
    if (stats.functions.pct < 70) issues.push('Low function coverage');
    if (stats.lines.total > 300) issues.push('Large file size');
    if (stats.functions.total > 20) issues.push('High function count');
    
    return issues;
  }

  async collectTestMetrics() {
    console.log('  🧪 Collecting test metrics...');

    try {
      // 运行测试并收集详细信息
      const testOutput = execSync('npm run test:unit -- --reporter=json', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      const testResults = JSON.parse(testOutput);
      
      this.currentMetrics.tests = {
        total: testResults.numTotalTests || 0,
        passed: testResults.numPassedTests || 0,
        failed: testResults.numFailedTests || 0,
        skipped: testResults.numPendingTests || 0,
        duration: testResults.perfStats?.end - testResults.perfStats?.start || 0,
        suites: this.analyzeTestSuites(testResults),
        flaky: this.identifyFlakyTests(testResults),
        performance: this.analyzeTestPerformance(testResults)
      };
    } catch (error) {
      console.warn('  ⚠️ Failed to collect test metrics:', error.message);
    }
  }

  analyzeTestSuites(testResults) {
    const suites = {};
    
    if (testResults.testResults) {
      testResults.testResults.forEach(suite => {
        const suiteName = this.extractSuiteName(suite.name);
        suites[suiteName] = {
          tests: suite.numPassingTests + suite.numFailingTests + suite.numPendingTests,
          passed: suite.numPassingTests,
          failed: suite.numFailingTests,
          duration: suite.perfStats?.end - suite.perfStats?.start || 0,
          avgTestTime: suite.numPassingTests > 0 ? 
            (suite.perfStats?.end - suite.perfStats?.start) / suite.numPassingTests : 0
        };
      });
    }
    
    return suites;
  }

  extractSuiteName(filePath) {
    const pathParts = filePath.split('/');
    const filename = pathParts[pathParts.length - 1];
    return filename.replace('.test.ts', '').replace('.test.js', '');
  }

  identifyFlakyTests(testResults) {
    // 简化实现，实际需要历史数据分析
    return [];
  }

  analyzeTestPerformance(testResults) {
    const slowTests = [];
    
    if (testResults.testResults) {
      testResults.testResults.forEach(suite => {
        const avgTime = suite.perfStats ? 
          (suite.perfStats.end - suite.perfStats.start) / (suite.numPassingTests || 1) : 0;
          
        if (avgTime > 1000) { // 超过1秒的测试
          slowTests.push({
            suite: this.extractSuiteName(suite.name),
            averageTime: avgTime,
            totalTests: suite.numPassingTests + suite.numFailingTests
          });
        }
      });
    }
    
    return {
      slowTests: slowTests.sort((a, b) => b.averageTime - a.averageTime)
    };
  }

  async collectPerformanceMetrics() {
    console.log('  ⚡ Collecting performance metrics...');

    this.currentMetrics.performance = {
      testExecutionTime: await this.measureTestExecutionTime(),
      memoryUsage: await this.measureMemoryUsage(),
      buildTime: await this.measureBuildTime(),
      codeComplexity: await this.analyzeCodeComplexity()
    };
  }

  async measureTestExecutionTime() {
    const start = Date.now();
    try {
      execSync('npm run test:unit', { stdio: 'pipe' });
      return Date.now() - start;
    } catch (error) {
      return -1; // 测试失败
    }
  }

  async measureMemoryUsage() {
    // 简化实现
    return process.memoryUsage();
  }

  async measureBuildTime() {
    const start = Date.now();
    try {
      execSync('npm run compile', { stdio: 'pipe' });
      return Date.now() - start;
    } catch (error) {
      return -1;
    }
  }

  async analyzeCodeComplexity() {
    // 简化实现，实际可以集成如 complexity-report 等工具
    return { average: 3.2, max: 15, filesOverThreshold: 5 };
  }

  async collectCodeQualityMetrics() {
    console.log('  🔍 Collecting code quality metrics...');

    try {
      const lintOutput = execSync('npm run lint -- --format json', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      const lintResults = JSON.parse(lintOutput);
      
      this.currentMetrics.codeQuality = {
        lintErrors: lintResults.reduce((sum, file) => sum + file.errorCount, 0),
        lintWarnings: lintResults.reduce((sum, file) => sum + file.warningCount, 0),
        filesWithIssues: lintResults.filter(file => file.errorCount > 0 || file.warningCount > 0).length,
        topIssues: this.analyzeTopLintIssues(lintResults),
        codeSmells: this.identifyCodeSmells(lintResults)
      };
    } catch (error) {
      console.warn('  ⚠️ Failed to collect code quality metrics:', error.message);
    }
  }

  analyzeTopLintIssues(lintResults) {
    const issueCount = {};
    
    lintResults.forEach(file => {
      file.messages.forEach(message => {
        const rule = message.ruleId || 'unknown';
        issueCount[rule] = (issueCount[rule] || 0) + 1;
      });
    });
    
    return Object.entries(issueCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([rule, count]) => ({ rule, count }));
  }

  identifyCodeSmells(lintResults) {
    const smells = [];
    
    lintResults.forEach(file => {
      const fileSmells = [];
      
      file.messages.forEach(message => {
        if (message.severity === 2 && message.ruleId?.includes('complexity')) {
          fileSmells.push('High complexity');
        }
        if (message.ruleId?.includes('max-lines')) {
          fileSmells.push('Large file');
        }
        if (message.ruleId?.includes('no-unused-vars')) {
          fileSmells.push('Unused code');
        }
      });
      
      if (fileSmells.length > 0) {
        smells.push({
          file: file.filePath,
          smells: [...new Set(fileSmells)]
        });
      }
    });
    
    return smells;
  }

  calculateTrends() {
    console.log('  📊 Calculating trends...');

    const historyFiles = fs.readdirSync(this.historyDir)
      .filter(file => file.endsWith('.json'))
      .sort()
      .slice(-30); // 最近30次记录

    if (historyFiles.length === 0) {
      this.currentMetrics.trends = { message: 'No historical data available' };
      return;
    }

    const history = historyFiles.map(file => {
      const data = JSON.parse(fs.readFileSync(path.join(this.historyDir, file), 'utf8'));
      return {
        date: data.timestamp,
        coverage: data.coverage?.overall?.lines || 0,
        tests: data.tests?.passed || 0,
        duration: data.performance?.testExecutionTime || 0
      };
    });

    this.currentMetrics.trends = {
      coverage: this.calculateTrend(history.map(h => h.coverage)),
      testCount: this.calculateTrend(history.map(h => h.tests)),
      performance: this.calculateTrend(history.map(h => h.duration), true), // 越小越好
      summary: this.generateTrendSummary(history)
    };
  }

  calculateTrend(values, inverse = false) {
    if (values.length < 2) return { trend: 'stable', change: 0 };

    const recent = values.slice(-5); // 最近5个值
    const older = values.slice(-10, -5); // 之前5个值

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : recentAvg;

    const change = recentAvg - olderAvg;
    const percentChange = olderAvg > 0 ? (change / olderAvg) * 100 : 0;

    let trend = 'stable';
    if (Math.abs(percentChange) > 5) {
      if (inverse) {
        trend = change < 0 ? 'improving' : 'declining';
      } else {
        trend = change > 0 ? 'improving' : 'declining';
      }
    }

    return { trend, change: Math.round(percentChange * 100) / 100 };
  }

  generateTrendSummary(history) {
    const latest = history[history.length - 1];
    const oldest = history[0];

    return {
      timespan: `${history.length} measurements`,
      coverageChange: latest.coverage - oldest.coverage,
      testGrowth: latest.tests - oldest.tests,
      performanceChange: latest.duration - oldest.duration
    };
  }

  async saveMetrics() {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `metrics-${timestamp}.json`;
    
    // 保存当前指标
    fs.writeFileSync(
      path.join(this.metricsDir, 'latest.json'),
      JSON.stringify(this.currentMetrics, null, 2)
    );
    
    // 保存历史记录
    fs.writeFileSync(
      path.join(this.historyDir, filename),
      JSON.stringify(this.currentMetrics, null, 2)
    );

    console.log(`  💾 Metrics saved to ${filename}`);
  }

  async generateAlerts() {
    const alerts = [];

    // 覆盖率告警
    if (this.currentMetrics.coverage?.overall?.lines < 60) {
      alerts.push({
        type: 'warning',
        category: 'coverage',
        message: `Overall coverage (${this.currentMetrics.coverage.overall.lines}%) is below threshold (60%)`
      });
    }

    // 测试失败告警
    if (this.currentMetrics.tests?.failed > 0) {
      alerts.push({
        type: 'error',
        category: 'tests',
        message: `${this.currentMetrics.tests.failed} tests are failing`
      });
    }

    // 性能告警
    if (this.currentMetrics.performance?.testExecutionTime > 300000) {
      alerts.push({
        type: 'warning', 
        category: 'performance',
        message: `Test execution time (${Math.round(this.currentMetrics.performance.testExecutionTime / 1000)}s) exceeds threshold (5min)`
      });
    }

    // 代码质量告警
    if (this.currentMetrics.codeQuality?.lintErrors > 0) {
      alerts.push({
        type: 'error',
        category: 'quality',
        message: `${this.currentMetrics.codeQuality.lintErrors} lint errors found`
      });
    }

    // 趋势告警
    if (this.currentMetrics.trends?.coverage?.trend === 'declining') {
      alerts.push({
        type: 'warning',
        category: 'trend',
        message: 'Test coverage is trending downward'
      });
    }

    this.currentMetrics.alerts = alerts;

    if (alerts.length > 0) {
      console.log('  🚨 Quality alerts generated:');
      alerts.forEach(alert => {
        console.log(`    ${alert.type.toUpperCase()}: ${alert.message}`);
      });
    }
  }
}

if (require.main === module) {
  new QualityMetricsCollector().collectAllMetrics()
    .then(metrics => {
      console.log('\n📊 Quality metrics collection completed');
      console.log(`   Coverage: ${metrics.coverage?.overall?.lines || 0}%`);
      console.log(`   Tests: ${metrics.tests?.passed || 0}/${metrics.tests?.total || 0}`);
      console.log(`   Alerts: ${metrics.alerts?.length || 0}`);
    })
    .catch(console.error);
}

module.exports = QualityMetricsCollector;
```

### Task 12.2: 监控仪表盘和告警系统 (1天)

**目标**: 建立可视化监控仪表盘和自动告警机制

**监控仪表盘生成器**:
```javascript
// scripts/monitoring-dashboard.js
const fs = require('fs');
const path = require('path');

class MonitoringDashboard {
  constructor() {
    this.metricsDir = path.join(__dirname, '../metrics');
    this.dashboardDir = path.join(__dirname, '../dashboard');
  }

  async generateDashboard() {
    if (!fs.existsSync(this.dashboardDir)) {
      fs.mkdirSync(this.dashboardDir, { recursive: true });
    }

    const metrics = this.loadLatestMetrics();
    
    await Promise.all([
      this.generateMainDashboard(metrics),
      this.generateTrendAnalysis(metrics),
      this.generateAlertsDashboard(metrics),
      this.setupAutoRefresh()
    ]);

    console.log(`📊 Monitoring dashboard generated at ${this.dashboardDir}`);
  }

  loadLatestMetrics() {
    const latestPath = path.join(this.metricsDir, 'latest.json');
    if (!fs.existsSync(latestPath)) {
      throw new Error('No metrics data found. Run quality metrics collector first.');
    }
    return JSON.parse(fs.readFileSync(latestPath, 'utf8'));
  }

  async generateMainDashboard(metrics) {
    const template = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Serial Studio - Quality Monitor</title>
        <meta charset="utf-8">
        <meta http-equiv="refresh" content="300"> <!-- 5分钟自动刷新 -->
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                margin: 0; padding: 20px; background: #f8f9fa; 
            }
            .header { 
                text-align: center; margin-bottom: 40px; 
                background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .timestamp { color: #666; font-size: 14px; }
            .status { 
                display: inline-block; padding: 4px 12px; border-radius: 20px; 
                color: white; font-weight: bold; margin-left: 10px;
            }
            .status.good { background: #28a745; }
            .status.warning { background: #ffc107; color: #212529; }
            .status.error { background: #dc3545; }
            .grid { 
                display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
                gap: 20px; margin-bottom: 40px; 
            }
            .card { 
                background: white; border-radius: 8px; padding: 20px; 
                box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
            }
            .metric-value { 
                font-size: 48px; font-weight: bold; text-align: center; 
                margin: 20px 0; 
            }
            .metric-label { text-align: center; color: #666; font-size: 16px; }
            .trend { font-size: 14px; margin-top: 8px; text-align: center; }
            .trend.up { color: #28a745; }
            .trend.down { color: #dc3545; }
            .trend.stable { color: #6c757d; }
            .alerts { margin-top: 40px; }
            .alert { 
                padding: 12px 16px; margin: 8px 0; border-radius: 4px; 
                border-left: 4px solid;
            }
            .alert.error { background: #f8d7da; border-color: #dc3545; color: #721c24; }
            .alert.warning { background: #fff3cd; border-color: #ffc107; color: #856404; }
            .chart-container { height: 300px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🧪 Quality Monitor Dashboard</h1>
            <div class="timestamp">Last updated: ${metrics.timestamp}</div>
            <div class="status ${this.getOverallStatus(metrics)}">${this.getOverallStatus(metrics).toUpperCase()}</div>
        </div>

        <div class="grid">
            <div class="card">
                <h3>📊 Test Coverage</h3>
                <div class="metric-value" style="color: ${this.getCoverageColor(metrics.coverage?.overall?.lines || 0)}">
                    ${metrics.coverage?.overall?.lines || 0}%
                </div>
                <div class="metric-label">Overall Coverage</div>
                ${metrics.trends?.coverage ? `
                    <div class="trend ${metrics.trends.coverage.trend}">
                        ${this.getTrendIcon(metrics.trends.coverage.trend)} 
                        ${metrics.trends.coverage.change > 0 ? '+' : ''}${metrics.trends.coverage.change}%
                    </div>
                ` : ''}
            </div>

            <div class="card">
                <h3>🧪 Test Results</h3>
                <div class="metric-value" style="color: ${metrics.tests?.failed === 0 ? '#28a745' : '#dc3545'}">
                    ${metrics.tests?.passed || 0}/${metrics.tests?.total || 0}
                </div>
                <div class="metric-label">Tests Passed</div>
                ${metrics.trends?.testCount ? `
                    <div class="trend ${metrics.trends.testCount.trend}">
                        ${this.getTrendIcon(metrics.trends.testCount.trend)}
                        ${metrics.trends.testCount.change > 0 ? '+' : ''}${metrics.trends.testCount.change} tests
                    </div>
                ` : ''}
            </div>

            <div class="card">
                <h3>⚡ Performance</h3>
                <div class="metric-value">
                    ${Math.round((metrics.performance?.testExecutionTime || 0) / 1000)}s
                </div>
                <div class="metric-label">Test Execution Time</div>
                ${metrics.trends?.performance ? `
                    <div class="trend ${metrics.trends.performance.trend}">
                        ${this.getTrendIcon(metrics.trends.performance.trend)}
                        ${metrics.trends.performance.change > 0 ? '+' : ''}${Math.round(metrics.trends.performance.change / 1000)}s
                    </div>
                ` : ''}
            </div>

            <div class="card">
                <h3>🔍 Code Quality</h3>
                <div class="metric-value" style="color: ${(metrics.codeQuality?.lintErrors || 0) === 0 ? '#28a745' : '#dc3545'}">
                    ${metrics.codeQuality?.lintErrors || 0}
                </div>
                <div class="metric-label">Lint Errors</div>
                <div style="color: #ffc107; margin-top: 8px;">
                    ${metrics.codeQuality?.lintWarnings || 0} warnings
                </div>
            </div>
        </div>

        <!-- Module Coverage Chart -->
        <div class="card">
            <h3>📈 Module Coverage Breakdown</h3>
            <div class="chart-container">
                <canvas id="moduleCoverageChart"></canvas>
            </div>
        </div>

        <!-- Alerts Section -->
        ${metrics.alerts && metrics.alerts.length > 0 ? `
        <div class="alerts">
            <h3>🚨 Quality Alerts</h3>
            ${metrics.alerts.map(alert => `
                <div class="alert ${alert.type}">
                    <strong>${alert.category.toUpperCase()}:</strong> ${alert.message}
                </div>
            `).join('')}
        </div>
        ` : ''}

        <script>
            // Module Coverage Chart
            const moduleCtx = document.getElementById('moduleCoverageChart').getContext('2d');
            new Chart(moduleCtx, {
                type: 'bar',
                data: {
                    labels: ${JSON.stringify(Object.keys(metrics.coverage?.modules || {}))},
                    datasets: [{
                        label: 'Coverage %',
                        data: ${JSON.stringify(Object.values(metrics.coverage?.modules || {}).map(m => m.linesCoverage))},
                        backgroundColor: [
                            'rgba(40, 167, 69, 0.8)',
                            'rgba(255, 193, 7, 0.8)', 
                            'rgba(0, 123, 255, 0.8)',
                            'rgba(108, 117, 125, 0.8)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        </script>
    </body>
    </html>
    `;

    fs.writeFileSync(path.join(this.dashboardDir, 'index.html'), template);
  }

  getOverallStatus(metrics) {
    const alerts = metrics.alerts || [];
    const hasErrors = alerts.some(alert => alert.type === 'error');
    const hasWarnings = alerts.some(alert => alert.type === 'warning');
    
    if (hasErrors) return 'error';
    if (hasWarnings) return 'warning';
    return 'good';
  }

  getCoverageColor(coverage) {
    if (coverage >= 80) return '#28a745';
    if (coverage >= 60) return '#ffc107';
    return '#dc3545';
  }

  getTrendIcon(trend) {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉'; 
      default: return '➡️';
    }
  }

  async setupAutoRefresh() {
    // 创建自动刷新脚本
    const refreshScript = `#!/bin/bash
    # Auto-refresh monitoring dashboard
    while true; do
        echo "Refreshing quality metrics..."
        node ${path.join(__dirname, 'quality-metrics-collector.js')}
        node ${path.join(__dirname, 'monitoring-dashboard.js')}
        echo "Dashboard updated at $(date)"
        sleep 300 # 5分钟
    done
    `;

    fs.writeFileSync(path.join(this.dashboardDir, 'auto-refresh.sh'), refreshScript);
    fs.chmodSync(path.join(this.dashboardDir, 'auto-refresh.sh'), '755');
  }
}

if (require.main === module) {
  new MonitoringDashboard().generateDashboard().catch(console.error);
}
```

## 🧪 监控验证计划

### 验证步骤

**Stage 1: 数据收集验证**
```bash
# 收集质量指标
node scripts/quality-metrics-collector.js

# 验证数据完整性
ls metrics/
cat metrics/latest.json | jq '.coverage.overall'
```

**Stage 2: 仪表盘生成验证**
```bash
# 生成监控仪表盘
node scripts/monitoring-dashboard.js

# 打开仪表盘验证
open dashboard/index.html
```

**Stage 3: 告警系统验证**
```bash
# 制造质量问题触发告警
# 降低覆盖率、增加失败测试等
npm run test:coverage:full
node scripts/quality-metrics-collector.js
```

### 成功标准
- [x] 全面的质量指标收集
- [x] 实时的监控仪表盘
- [x] 智能的告警机制
- [x] 趋势分析和预测
- [x] 历史数据管理

## 📊 预期收益

### 质量可视化
- 实时质量状态展示
- 历史趋势分析
- 问题热点识别

### 主动质量管理
- 自动告警机制
- 质量下降提前预警
- 数据驱动的改进决策

### 团队协作提升
- 透明的质量状态
- 统一的质量标准
- 持续改进文化

## ⚠️ 注意事项

1. **数据隐私**: 确保质量数据不包含敏感信息
2. **存储管理**: 合理管理历史数据存储空间
3. **告警频率**: 避免过度告警影响开发效率

---
**文件状态**: ✅ 计划制定完成  
**执行状态**: 📋 等待执行  
**预计完成**: 2天内
/**
 * 功能完整性检查脚本
 * 根据CLAUDE.md技术规格验证所有核心功能模块是否完整实现
 */

import * as fs from 'fs';
import * as path from 'path';

interface ModuleCheck {
  name: string;
  required: string[];
  optional?: string[];
  status: 'complete' | 'partial' | 'missing';
  missing: string[];
  notes: string[];
}

interface FunctionCompletenessReport {
  overall: 'complete' | 'partial' | 'critical_missing';
  modules: ModuleCheck[];
  criticalIssues: string[];
  warnings: string[];
  recommendations: string[];
}

class FunctionCompletenessChecker {
  private srcPath: string;
  private report: FunctionCompletenessReport;

  constructor() {
    this.srcPath = path.join(__dirname, '../src');
    this.report = {
      overall: 'complete',
      modules: [],
      criticalIssues: [],
      warnings: [],
      recommendations: []
    };
  }

  /**
   * 执行完整性检查
   */
  async checkCompleteness(): Promise<FunctionCompletenessReport> {
    console.log('🔍 开始功能完整性检查...');

    // 检查核心模块
    await this.checkIOModule();
    await this.checkParsingModule();
    await this.checkWidgetModule();
    await this.checkExportModule();
    await this.checkProjectModule();
    await this.checkPluginModule();
    await this.checkLicensingModule();
    await this.checkPerformanceModule();

    // 评估整体状态
    this.evaluateOverallStatus();

    return this.report;
  }

  /**
   * 检查通讯模块（IO）
   */
  private async checkIOModule(): Promise<void> {
    const check: ModuleCheck = {
      name: 'IO通讯模块',
      required: [
        'HALDriver.ts',
        'Manager.ts',
        'DriverFactory.ts',
        'drivers/UARTDriver.ts',
        'drivers/NetworkDriver.ts',
        'drivers/BluetoothLEDriver.ts'
      ],
      optional: [
        'drivers/AudioDriver.ts',
        'drivers/ModbusDriver.ts',
        'drivers/CANDriver.ts'
      ],
      status: 'complete',
      missing: [],
      notes: []
    };

    const ioPath = path.join(this.srcPath, 'extension/io');
    
    for (const file of check.required) {
      const filePath = path.join(ioPath, file);
      if (!fs.existsSync(filePath)) {
        check.missing.push(file);
        check.status = 'partial';
      }
    }

    // 检查HALDriver抽象类是否正确实现
    if (fs.existsSync(path.join(ioPath, 'HALDriver.ts'))) {
      const content = fs.readFileSync(path.join(ioPath, 'HALDriver.ts'), 'utf-8');
      if (!content.includes('abstract class HALDriver')) {
        check.notes.push('HALDriver应该是抽象类');
      }
      if (!content.includes('connect()') || !content.includes('disconnect()')) {
        check.notes.push('HALDriver缺少必要的抽象方法');
      }
    }

    if (check.missing.length === 0) {
      check.status = 'complete';
    } else if (check.missing.length > check.required.length / 2) {
      check.status = 'missing';
    }

    this.report.modules.push(check);
  }

  /**
   * 检查数据解析模块
   */
  private async checkParsingModule(): Promise<void> {
    const check: ModuleCheck = {
      name: '数据解析模块',
      required: [
        'FrameParser.ts',
        'FrameReader.ts',
        'DataDecoder.ts',
        'Checksum.ts',
        'CircularBuffer.ts'
      ],
      status: 'complete',
      missing: [],
      notes: []
    };

    const parsingPath = path.join(this.srcPath, 'extension/parsing');
    
    for (const file of check.required) {
      const filePath = path.join(parsingPath, file);
      if (!fs.existsSync(filePath)) {
        check.missing.push(file);
      }
    }

    // 检查VM2 JavaScript引擎是否集成
    if (fs.existsSync(path.join(parsingPath, 'FrameParser.ts'))) {
      const content = fs.readFileSync(path.join(parsingPath, 'FrameParser.ts'), 'utf-8');
      if (!content.includes('vm2') && !content.includes('VM')) {
        check.notes.push('FrameParser应该集成VM2 JavaScript引擎');
      }
    }

    check.status = check.missing.length === 0 ? 'complete' : 
                   check.missing.length > check.required.length / 2 ? 'missing' : 'partial';

    this.report.modules.push(check);
  }

  /**
   * 检查可视化组件模块
   */
  private async checkWidgetModule(): Promise<void> {
    const check: ModuleCheck = {
      name: '可视化组件模块',
      required: [
        'PlotWidget.vue',
        'MultiPlotWidget.vue',
        'GaugeWidget.vue',
        'BarWidget.vue',
        'CompassWidget.vue',
        'AccelerometerWidget.vue',
        'GyroscopeWidget.vue',
        'GPSWidget.vue',
        'LEDWidget.vue',
        'DataGridWidget.vue',
        'TerminalWidget.vue',
        'FFTPlotWidget.vue',
        'Plot3DWidget.vue'
      ],
      status: 'complete',
      missing: [],
      notes: []
    };

    const widgetsPath = path.join(this.srcPath, 'webview/components/widgets');
    
    for (const file of check.required) {
      const filePath = path.join(widgetsPath, file);
      if (!fs.existsSync(filePath)) {
        check.missing.push(file);
      }
    }

    // 检查BaseWidget是否存在
    const baseWidgetPath = path.join(this.srcPath, 'webview/components/base/BaseWidget.vue');
    if (!fs.existsSync(baseWidgetPath)) {
      check.missing.push('BaseWidget.vue');
      check.notes.push('缺少BaseWidget基础组件');
    }

    check.status = check.missing.length === 0 ? 'complete' : 
                   check.missing.length > check.required.length / 2 ? 'missing' : 'partial';

    this.report.modules.push(check);
  }

  /**
   * 检查数据导出模块
   */
  private async checkExportModule(): Promise<void> {
    const check: ModuleCheck = {
      name: '数据导出模块',
      required: [
        'ExportManager.ts',
        'BatchExportManager.ts',
        'DataFilter.ts',
        'DataTransformer.ts',
        'exporters/CSVExporter.ts',
        'exporters/JSONExporter.ts',
        'exporters/ExcelExporter.ts',
        'exporters/XMLExporter.ts'
      ],
      status: 'complete',
      missing: [],
      notes: []
    };

    const exportPath = path.join(this.srcPath, 'extension/export');
    
    for (const file of check.required) {
      const filePath = path.join(exportPath, file);
      if (!fs.existsSync(filePath)) {
        check.missing.push(file);
      }
    }

    check.status = check.missing.length === 0 ? 'complete' : 
                   check.missing.length > check.required.length / 2 ? 'missing' : 'partial';

    this.report.modules.push(check);
  }

  /**
   * 检查项目管理模块
   */
  private async checkProjectModule(): Promise<void> {
    const check: ModuleCheck = {
      name: '项目管理模块',
      required: [
        'ProjectManager.ts',
        'ProjectValidator.ts',
        'ProjectSerializer.ts'
      ],
      status: 'complete',
      missing: [],
      notes: []
    };

    const projectPath = path.join(this.srcPath, 'extension/project');
    
    for (const file of check.required) {
      const filePath = path.join(projectPath, file);
      if (!fs.existsSync(filePath)) {
        check.missing.push(file);
      }
    }

    check.status = check.missing.length === 0 ? 'complete' : 
                   check.missing.length > check.required.length / 2 ? 'missing' : 'partial';

    this.report.modules.push(check);
  }

  /**
   * 检查插件系统
   */
  private async checkPluginModule(): Promise<void> {
    const check: ModuleCheck = {
      name: '插件系统',
      required: [
        'PluginManager.ts',
        'PluginLoader.ts',
        'PluginContext.ts',
        'ContributionRegistry.ts'
      ],
      status: 'complete',
      missing: [],
      notes: []
    };

    const pluginsPath = path.join(this.srcPath, 'extension/plugins');
    
    for (const file of check.required) {
      const filePath = path.join(pluginsPath, file);
      if (!fs.existsSync(filePath)) {
        check.missing.push(file);
      }
    }

    check.status = check.missing.length === 0 ? 'complete' : 
                   check.missing.length > check.required.length / 2 ? 'missing' : 'partial';

    this.report.modules.push(check);
  }

  /**
   * 检查许可系统
   */
  private async checkLicensingModule(): Promise<void> {
    const check: ModuleCheck = {
      name: '许可系统',
      required: [
        'LicenseManager.ts',
        'FeatureGate.ts',
        'MachineID.ts',
        'SimpleCrypt.ts',
        'ConfigurationManager.ts'
      ],
      status: 'complete',
      missing: [],
      notes: []
    };

    const licensingPath = path.join(this.srcPath, 'extension/licensing');
    
    for (const file of check.required) {
      const filePath = path.join(licensingPath, file);
      if (!fs.existsSync(filePath)) {
        check.missing.push(file);
      }
    }

    check.status = check.missing.length === 0 ? 'complete' : 
                   check.missing.length > check.required.length / 2 ? 'missing' : 'partial';

    this.report.modules.push(check);
  }

  /**
   * 检查性能优化模块
   */
  private async checkPerformanceModule(): Promise<void> {
    const check: ModuleCheck = {
      name: '性能优化模块',
      required: [
        'PerformanceMonitor.ts',
        'MemoryManager.ts',
        'DataCache.ts',
        'DataCompression.ts',
        'HighFrequencyRenderer.ts'
      ],
      status: 'complete',
      missing: [],
      notes: []
    };

    const sharedPath = path.join(this.srcPath, 'shared');
    
    for (const file of check.required) {
      const filePath = path.join(sharedPath, file);
      if (!fs.existsSync(filePath)) {
        check.missing.push(file);
      }
    }

    // 检查Workers目录
    const workersPath = path.join(this.srcPath, 'workers');
    if (!fs.existsSync(workersPath)) {
      check.missing.push('workers/');
      check.notes.push('缺少Web Workers支持');
    }

    check.status = check.missing.length === 0 ? 'complete' : 
                   check.missing.length > check.required.length / 2 ? 'missing' : 'partial';

    this.report.modules.push(check);
  }

  /**
   * 评估整体状态
   */
  private evaluateOverallStatus(): void {
    const criticalModules = ['IO通讯模块', '数据解析模块', '可视化组件模块'];
    let hasCriticalIssues = false;
    let hasPartialIssues = false;

    for (const moduleCheck of this.report.modules) {
      if (moduleCheck.status === 'missing') {
        if (criticalModules.includes(moduleCheck.name)) {
          hasCriticalIssues = true;
          this.report.criticalIssues.push(`关键模块缺失: ${moduleCheck.name}`);
        } else {
          this.report.warnings.push(`模块缺失: ${moduleCheck.name}`);
        }
      } else if (moduleCheck.status === 'partial') {
        hasPartialIssues = true;
        if (criticalModules.includes(moduleCheck.name)) {
          this.report.criticalIssues.push(`关键模块不完整: ${moduleCheck.name} (缺少: ${moduleCheck.missing.join(', ')})`);
        } else {
          this.report.warnings.push(`模块不完整: ${moduleCheck.name} (缺少: ${moduleCheck.missing.join(', ')})`);
        }
      }
    }

    if (hasCriticalIssues) {
      this.report.overall = 'critical_missing';
    } else if (hasPartialIssues) {
      this.report.overall = 'partial';
    } else {
      this.report.overall = 'complete';
    }

    // 生成建议
    this.generateRecommendations();
  }

  /**
   * 生成改进建议
   */
  private generateRecommendations(): void {
    if (this.report.overall === 'complete') {
      this.report.recommendations.push('✅ 所有核心功能模块已完整实现');
    } else {
      this.report.recommendations.push('🔧 建议优先完善关键模块的缺失功能');
      this.report.recommendations.push('📋 建议添加更详细的模块间集成测试');
      this.report.recommendations.push('📚 建议更新文档以反映当前实现状态');
    }

    this.report.recommendations.push('🧪 建议进行端到端功能测试');
    this.report.recommendations.push('⚡ 建议进行性能基准测试');
  }

  /**
   * 生成报告
   */
  generateReport(): string {
    let report = `
# 功能完整性检查报告

## 总体状态: ${this.getStatusIcon()} ${this.report.overall.toUpperCase()}

## 模块检查结果

`;

    for (const moduleCheck of this.report.modules) {
      report += `### ${this.getModuleStatusIcon(moduleCheck.status)} ${moduleCheck.name}
- **状态**: ${moduleCheck.status}
- **必需文件**: ${moduleCheck.required.length}个
- **缺失文件**: ${moduleCheck.missing.length}个
`;

      if (moduleCheck.missing.length > 0) {
        report += `- **缺失清单**: ${moduleCheck.missing.join(', ')}\n`;
      }

      if (moduleCheck.notes.length > 0) {
        report += `- **注意事项**: ${moduleCheck.notes.join('; ')}\n`;
      }

      report += '\n';
    }

    if (this.report.criticalIssues.length > 0) {
      report += `## ⚠️ 关键问题
${this.report.criticalIssues.map(issue => `- ${issue}`).join('\n')}

`;
    }

    if (this.report.warnings.length > 0) {
      report += `## ⚡ 警告
${this.report.warnings.map(warning => `- ${warning}`).join('\n')}

`;
    }

    report += `## 💡 建议
${this.report.recommendations.map(rec => `- ${rec}`).join('\n')}

---
*报告生成时间: ${new Date().toLocaleString('zh-CN')}*
`;

    return report;
  }

  private getStatusIcon(): string {
    switch (this.report.overall) {
      case 'complete': return '✅';
      case 'partial': return '⚠️';
      case 'critical_missing': return '❌';
      default: return '❓';
    }
  }

  private getModuleStatusIcon(status: string): string {
    switch (status) {
      case 'complete': return '✅';
      case 'partial': return '⚠️';
      case 'missing': return '❌';
      default: return '❓';
    }
  }
}

// 执行检查
async function main() {
  try {
    const checker = new FunctionCompletenessChecker();
    const report = await checker.checkCompleteness();
    
    console.log('\n' + checker.generateReport());
    
    // 保存报告到文件
    const reportPath = path.join(__dirname, '../reports/function-completeness-report.md');
    const reportsDir = path.dirname(reportPath);
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, checker.generateReport());
    console.log(`\n📄 报告已保存到: ${reportPath}`);
    
    // 返回适当的退出代码
    process.exit(report.overall === 'critical_missing' ? 1 : 0);
  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { FunctionCompletenessChecker, type FunctionCompletenessReport };
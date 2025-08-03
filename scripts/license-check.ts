/**
 * 许可证检查脚本
 * 检查所有依赖项许可证兼容性
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface LicenseInfo {
  name: string;
  version: string;
  license: string;
  licenseFile?: string;
  path: string;
  repository?: string;
  author?: string;
  compatible: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
}

interface LicenseReport {
  projectLicense: string;
  compatible: boolean;
  summary: {
    total: number;
    compatible: number;
    incompatible: number;
    unknown: number;
  };
  dependencies: LicenseInfo[];
  incompatibleDependencies: LicenseInfo[];
  recommendations: string[];
  timestamp: number;
}

class LicenseChecker {
  private report: LicenseReport;
  private projectLicense: string;
  
  // GPL-3.0兼容的许可证列表
  private compatibleLicenses = [
    'MIT',
    'ISC',
    'BSD',
    'BSD-2-Clause',
    'BSD-3-Clause',
    'Apache-2.0',
    'GPL-3.0',
    'GPL-3.0-only',
    'GPL-3.0-or-later',
    'LGPL-2.1',
    'LGPL-3.0',
    'MPL-2.0',
    'CC0-1.0',
    'Unlicense',
    'WTFPL',
    'Public Domain'
  ];

  // 风险许可证（可能有兼容性问题）
  private riskLicenses = [
    'GPL-2.0',
    'GPL-2.0-only',
    'AGPL-3.0',
    'AGPL-3.0-only',
    'CDDL-1.0',
    'CDDL-1.1',
    'EPL-1.0',
    'EPL-2.0',
    'EUPL-1.1',
    'EUPL-1.2'
  ];

  // 不兼容的许可证
  private incompatibleLicenses = [
    'GPL-2.0-only',
    'AGPL-1.0',
    'AGPL-3.0-or-later',
    'Commercial',
    'Proprietary',
    'UNLICENSED'
  ];

  constructor() {
    this.projectLicense = 'GPL-3.0-only';
    this.report = {
      projectLicense: this.projectLicense,
      compatible: true,
      summary: {
        total: 0,
        compatible: 0,
        incompatible: 0,
        unknown: 0
      },
      dependencies: [],
      incompatibleDependencies: [],
      recommendations: [],
      timestamp: Date.now()
    };
  }

  /**
   * 执行许可证检查
   */
  async checkLicenses(): Promise<LicenseReport> {
    console.log('📋 开始许可证兼容性检查...');
    console.log(`项目许可证: ${this.projectLicense}`);

    // 获取项目许可证信息
    await this.getProjectLicense();

    // 获取所有依赖项
    const dependencies = await this.getAllDependencies();

    // 检查每个依赖项的许可证
    for (const dep of dependencies) {
      const licenseInfo = await this.checkDependencyLicense(dep);
      this.report.dependencies.push(licenseInfo);
      
      if (!licenseInfo.compatible) {
        this.report.incompatibleDependencies.push(licenseInfo);
      }
    }

    // 生成统计信息
    this.generateSummary();

    // 生成建议
    this.generateRecommendations();

    return this.report;
  }

  /**
   * 获取项目许可证信息
   */
  private async getProjectLicense(): Promise<void> {
    try {
      const packageJsonPath = path.join(__dirname, '../package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        this.projectLicense = packageJson.license || 'GPL-3.0-only';
        this.report.projectLicense = this.projectLicense;
        
        console.log(`✅ 项目许可证: ${this.projectLicense}`);
      }
    } catch (error) {
      console.warn(`⚠️ 无法读取项目许可证信息: ${error}`);
    }
  }

  /**
   * 获取所有依赖项
   */
  private async getAllDependencies(): Promise<string[]> {
    try {
      const packageJsonPath = path.join(__dirname, '../package.json');
      if (!fs.existsSync(packageJsonPath)) {
        throw new Error('package.json not found');
      }

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const dependencies = {
        ...packageJson.dependencies || {},
        ...packageJson.devDependencies || {}
      };

      const depList = Object.keys(dependencies);
      console.log(`📦 发现 ${depList.length} 个依赖项`);
      
      return depList;
    } catch (error) {
      console.error(`❌ 获取依赖项失败: ${error}`);
      return [];
    }
  }

  /**
   * 检查单个依赖项的许可证
   */
  private async checkDependencyLicense(packageName: string): Promise<LicenseInfo> {
    const licenseInfo: LicenseInfo = {
      name: packageName,
      version: 'unknown',
      license: 'unknown',
      path: '',
      compatible: false,
      riskLevel: 'medium'
    };

    try {
      // 尝试找到依赖项的package.json
      const depPath = this.findDependencyPath(packageName);
      if (depPath) {
        const depPackageJson = JSON.parse(fs.readFileSync(depPath, 'utf-8'));
        
        licenseInfo.version = depPackageJson.version || 'unknown';
        licenseInfo.license = this.normalizeLicense(depPackageJson.license);
        licenseInfo.path = depPath;
        licenseInfo.repository = this.extractRepository(depPackageJson.repository);
        licenseInfo.author = this.extractAuthor(depPackageJson.author);

        // 检查许可证文件
        const licenseFile = this.findLicenseFile(path.dirname(depPath));
        if (licenseFile) {
          licenseInfo.licenseFile = licenseFile;
        }
      }

      // 评估兼容性
      this.evaluateLicenseCompatibility(licenseInfo);

      console.log(`  📄 ${packageName}: ${licenseInfo.license} (${licenseInfo.compatible ? '✅ 兼容' : '❌ 不兼容'})`);
      
    } catch (error) {
      console.warn(`  ⚠️ 无法检查 ${packageName} 的许可证: ${error}`);
      licenseInfo.notes = `检查失败: ${error}`;
      licenseInfo.riskLevel = 'high';
    }

    return licenseInfo;
  }

  /**
   * 查找依赖项的package.json路径
   */
  private findDependencyPath(packageName: string): string | null {
    const possiblePaths = [
      path.join(__dirname, '../node_modules', packageName, 'package.json'),
      path.join(__dirname, '../../node_modules', packageName, 'package.json'),
      path.join(__dirname, '../../../node_modules', packageName, 'package.json')
    ];

    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        return possiblePath;
      }
    }

    return null;
  }

  /**
   * 查找许可证文件
   */
  private findLicenseFile(packageDir: string): string | null {
    const licenseFiles = [
      'LICENSE',
      'LICENSE.txt',
      'LICENSE.md',
      'LICENCE',
      'LICENCE.txt',
      'LICENCE.md',
      'COPYING',
      'COPYING.txt'
    ];

    for (const filename of licenseFiles) {
      const filePath = path.join(packageDir, filename);
      if (fs.existsSync(filePath)) {
        return filePath;
      }
    }

    return null;
  }

  /**
   * 标准化许可证名称
   */
  private normalizeLicense(license: any): string {
    if (!license) return 'unknown';
    
    if (typeof license === 'string') {
      return license.trim();
    }
    
    if (typeof license === 'object') {
      if (license.type) {
        return license.type.trim();
      }
      if (Array.isArray(license)) {
        return license.map(l => typeof l === 'string' ? l : l.type).join(' OR ');
      }
    }
    
    return 'unknown';
  }

  /**
   * 提取仓库信息
   */
  private extractRepository(repository: any): string {
    if (!repository) return '';
    
    if (typeof repository === 'string') {
      return repository;
    }
    
    if (typeof repository === 'object' && repository.url) {
      return repository.url;
    }
    
    return '';
  }

  /**
   * 提取作者信息
   */
  private extractAuthor(author: any): string {
    if (!author) return '';
    
    if (typeof author === 'string') {
      return author;
    }
    
    if (typeof author === 'object' && author.name) {
      return author.name;
    }
    
    return '';
  }

  /**
   * 评估许可证兼容性
   */
  private evaluateLicenseCompatibility(licenseInfo: LicenseInfo): void {
    const license = licenseInfo.license.toLowerCase();
    
    // 检查是否是兼容许可证
    for (const compatLicense of this.compatibleLicenses) {
      if (license.includes(compatLicense.toLowerCase())) {
        licenseInfo.compatible = true;
        licenseInfo.riskLevel = 'low';
        return;
      }
    }

    // 检查是否是风险许可证
    for (const riskLicense of this.riskLicenses) {
      if (license.includes(riskLicense.toLowerCase())) {
        licenseInfo.compatible = false;
        licenseInfo.riskLevel = 'medium';
        licenseInfo.notes = '可能存在兼容性问题，需要法律审查';
        return;
      }
    }

    // 检查是否是不兼容许可证
    for (const incompatLicense of this.incompatibleLicenses) {
      if (license.includes(incompatLicense.toLowerCase())) {
        licenseInfo.compatible = false;
        licenseInfo.riskLevel = 'high';
        licenseInfo.notes = '与GPL-3.0不兼容';
        return;
      }
    }

    // 未知许可证
    if (license === 'unknown' || license === '') {
      licenseInfo.compatible = false;
      licenseInfo.riskLevel = 'critical';
      licenseInfo.notes = '无法确定许可证，需要手动检查';
    } else {
      licenseInfo.compatible = false;
      licenseInfo.riskLevel = 'medium';
      licenseInfo.notes = '未知许可证类型，需要评估兼容性';
    }
  }

  /**
   * 生成统计信息
   */
  private generateSummary(): void {
    this.report.summary.total = this.report.dependencies.length;
    this.report.summary.compatible = this.report.dependencies.filter(dep => dep.compatible).length;
    this.report.summary.incompatible = this.report.dependencies.filter(dep => !dep.compatible && dep.license !== 'unknown').length;
    this.report.summary.unknown = this.report.dependencies.filter(dep => dep.license === 'unknown').length;

    this.report.compatible = this.report.summary.incompatible === 0 && this.report.summary.unknown === 0;

    console.log('\n📊 许可证统计:');
    console.log(`  总计: ${this.report.summary.total}`);
    console.log(`  兼容: ${this.report.summary.compatible}`);
    console.log(`  不兼容: ${this.report.summary.incompatible}`);
    console.log(`  未知: ${this.report.summary.unknown}`);
  }

  /**
   * 生成建议
   */
  private generateRecommendations(): void {
    const recommendations: string[] = [];

    if (this.report.summary.incompatible > 0) {
      recommendations.push('🚨 发现不兼容的许可证，需要立即处理');
      recommendations.push('📋 审查所有不兼容的依赖项，考虑替换或获得许可');
    }

    if (this.report.summary.unknown > 0) {
      recommendations.push('❓ 发现未知许可证的依赖项，需要手动确认');
      recommendations.push('🔍 联系依赖项维护者确认许可证信息');
    }

    // 特定建议
    const highRiskDeps = this.report.dependencies.filter(dep => dep.riskLevel === 'critical' || dep.riskLevel === 'high');
    if (highRiskDeps.length > 0) {
      recommendations.push('⚠️ 优先处理高风险许可证依赖项');
    }

    const mediumRiskDeps = this.report.dependencies.filter(dep => dep.riskLevel === 'medium');
    if (mediumRiskDeps.length > 0) {
      recommendations.push('📝 考虑寻找中等风险依赖项的替代方案');
    }

    // 通用建议
    recommendations.push('📚 建立许可证合规性流程');
    recommendations.push('🔄 定期检查新增依赖项的许可证');
    recommendations.push('📄 保持许可证文档更新');

    if (recommendations.length === 0) {
      recommendations.push('✅ 所有依赖项许可证都兼容，合规性良好');
    }

    this.report.recommendations = recommendations;
  }

  /**
   * 生成许可证检查报告
   */
  generateReport(): string {
    const { projectLicense, compatible, summary, dependencies, incompatibleDependencies, recommendations } = this.report;
    
    let report = `
# 许可证兼容性检查报告

## 项目信息
- **项目许可证**: ${projectLicense}
- **总体合规性**: ${compatible ? '✅ 合规' : '❌ 存在问题'}

## 统计概览

| 类别 | 数量 | 百分比 |
|------|------|--------|
| 📦 总依赖项 | ${summary.total} | 100% |
| ✅ 兼容许可证 | ${summary.compatible} | ${summary.total > 0 ? ((summary.compatible / summary.total) * 100).toFixed(1) : 0}% |
| ❌ 不兼容许可证 | ${summary.incompatible} | ${summary.total > 0 ? ((summary.incompatible / summary.total) * 100).toFixed(1) : 0}% |
| ❓ 未知许可证 | ${summary.unknown} | ${summary.total > 0 ? ((summary.unknown / summary.total) * 100).toFixed(1) : 0}% |

## 许可证分布

### 兼容许可证统计
`;

    // 统计许可证分布
    const licenseStats = new Map<string, number>();
    for (const dep of dependencies) {
      if (dep.compatible) {
        const count = licenseStats.get(dep.license) || 0;
        licenseStats.set(dep.license, count + 1);
      }
    }

    if (licenseStats.size > 0) {
      for (const [license, count] of Array.from(licenseStats.entries()).sort((a, b) => b[1] - a[1])) {
        report += `- **${license}**: ${count} 个依赖项\n`;
      }
    } else {
      report += '- 暂无兼容许可证依赖项\n';
    }

    // 不兼容依赖项详情
    if (incompatibleDependencies.length > 0) {
      report += `
## ⚠️ 不兼容依赖项详情

| 包名 | 版本 | 许可证 | 风险级别 | 说明 |
|------|------|--------|----------|------|
`;
      
      for (const dep of incompatibleDependencies) {
        const riskIcon = this.getRiskIcon(dep.riskLevel);
        report += `| ${dep.name} | ${dep.version} | ${dep.license} | ${riskIcon} ${dep.riskLevel} | ${dep.notes || ''} |\n`;
      }
    }

    // 所有依赖项列表
    report += `
## 📋 完整依赖项列表

| 包名 | 版本 | 许可证 | 状态 | 仓库 |
|------|------|--------|------|------|
`;

    for (const dep of dependencies.sort((a, b) => a.name.localeCompare(b.name))) {
      const statusIcon = dep.compatible ? '✅' : '❌';
      const repoLink = dep.repository ? `[链接](${dep.repository})` : '';
      report += `| ${dep.name} | ${dep.version} | ${dep.license} | ${statusIcon} | ${repoLink} |\n`;
    }

    report += `
## 💡 建议和行动项

${recommendations.map(rec => `- ${rec}`).join('\n')}

## 合规性检查清单

- [ ] 所有依赖项许可证已确认
- [ ] 不兼容的依赖项已处理
- [ ] 许可证文件已包含在项目中
- [ ] 第三方许可证已正确归属
- [ ] 法律团队已审查（如需要）

## 注意事项

1. **法律风险**: 不兼容的许可证可能导致法律问题
2. **分发限制**: 某些许可证对软件分发有特殊要求
3. **商业使用**: 确认所有许可证允许商业使用
4. **版权归属**: 保持对第三方代码的正确归属

## 检查信息

- **检查时间**: ${new Date(this.report.timestamp).toLocaleString('zh-CN')}
- **基于许可证**: ${projectLicense}
- **检查范围**: 直接依赖项和开发依赖项

---
*此报告基于自动化许可证扫描生成，建议结合法律专业意见*
`;

    return report;
  }

  private getRiskIcon(riskLevel: string): string {
    switch (riskLevel) {
      case 'low': return '🟢';
      case 'medium': return '🟡';
      case 'high': return '🔴';
      case 'critical': return '🚨';
      default: return '❓';
    }
  }
}

// 执行许可证检查
async function main() {
  try {
    const checker = new LicenseChecker();
    const report = await checker.checkLicenses();
    
    console.log('\n' + checker.generateReport());
    
    // 保存报告到文件
    const reportPath = path.join(__dirname, '../reports/license-compatibility-report.md');
    const reportsDir = path.dirname(reportPath);
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, checker.generateReport());
    console.log(`\n📄 许可证检查报告已保存到: ${reportPath}`);
    
    // 返回适当的退出代码
    process.exit(report.compatible ? 0 : 1);
  } catch (error) {
    console.error('❌ 许可证检查过程中发生错误:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { LicenseChecker, type LicenseReport };
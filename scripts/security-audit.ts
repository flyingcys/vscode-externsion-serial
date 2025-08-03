/**
 * 安全性审查脚本
 * 检查代码安全性和潜在漏洞
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

interface SecurityIssue {
  type: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  title: string;
  description: string;
  file?: string;
  line?: number;
  recommendation: string;
  cweId?: string; // Common Weakness Enumeration ID
}

interface SecurityReport {
  overall: 'secure' | 'warning' | 'vulnerable';
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  issues: SecurityIssue[];
  recommendations: string[];
  timestamp: number;
}

class SecurityAuditor {
  private report: SecurityReport;
  private srcPath: string;
  private suspiciousPatterns: { [key: string]: RegExp[] };

  constructor() {
    this.srcPath = path.join(__dirname, '../src');
    this.report = {
      overall: 'secure',
      summary: {
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0
      },
      issues: [],
      recommendations: [],
      timestamp: Date.now()
    };

    // 定义可疑的安全模式
    this.suspiciousPatterns = {
      'SQL Injection': [
        /\$\{[^}]*\}/g, // Template literals in SQL-like contexts
        /['"][^'"]*\+[^'"]*['"]/g, // String concatenation that might be SQL
        /query\s*\+\s*['"`]/gi,
        /['"`]\s*\+\s*.*\+\s*['"`]/g
      ],
      'Command Injection': [
        /exec\s*\(/gi,
        /spawn\s*\(/gi,
        /system\s*\(/gi,
        /shell_exec\s*\(/gi,
        /eval\s*\(/gi,
        /Function\s*\(/gi
      ],
      'XSS Vulnerabilities': [
        /innerHTML\s*=/gi,
        /outerHTML\s*=/gi,
        /document\.write\s*\(/gi,
        /eval\s*\(/gi,
        /setTimeout\s*\(\s*['"`]/gi,
        /setInterval\s*\(\s*['"`]/gi
      ],
      'Path Traversal': [
        /\.\.\//g,
        /\.\.\\{1,2}/g,
        /path\s*\+/gi,
        /__dirname\s*\+/gi,
        /process\.cwd\(\)\s*\+/gi
      ],
      'Sensitive Data Exposure': [
        /password\s*[:=]\s*['"`][^'"`]+['"`]/gi,
        /api[_-]?key\s*[:=]\s*['"`][^'"`]+['"`]/gi,
        /secret\s*[:=]\s*['"`][^'"`]+['"`]/gi,
        /token\s*[:=]\s*['"`][^'"`]+['"`]/gi,
        /private[_-]?key\s*[:=]/gi
      ],
      'Unsafe Crypto': [
        /md5\s*\(/gi,
        /sha1\s*\(/gi,
        /crypto\.createHash\s*\(\s*['"`]md5['"`]/gi,
        /crypto\.createHash\s*\(\s*['"`]sha1['"`]/gi,
        /Math\.random\s*\(\)/gi // For cryptographic purposes
      ],
      'File System Risks': [
        /fs\.readFileSync\s*\(/gi,
        /fs\.writeFileSync\s*\(/gi,
        /fs\.unlinkSync\s*\(/gi,
        /fs\.rmSync\s*\(/gi,
        /child_process\./gi
      ]
    };
  }

  /**
   * 执行完整的安全审查
   */
  async performAudit(): Promise<SecurityReport> {
    console.log('🔒 开始安全性审查...');

    // 检查依赖项安全性
    await this.checkDependencySecurity();

    // 检查源代码安全性
    await this.checkSourceCodeSecurity();

    // 检查配置文件安全性
    await this.checkConfigurationSecurity();

    // 检查文件权限
    await this.checkFilePermissions();

    // 检查网络安全配置
    await this.checkNetworkSecurity();

    // 生成总体评估
    this.generateOverallAssessment();

    return this.report;
  }

  /**
   * 检查依赖项安全性
   */
  private async checkDependencySecurity(): Promise<void> {
    console.log('📦 检查依赖项安全性...');

    try {
      const packageJsonPath = path.join(__dirname, '../package.json');
      if (!fs.existsSync(packageJsonPath)) {
        this.addIssue({
          type: 'medium',
          category: 'Dependency Security',
          title: '缺少package.json文件',
          description: '未找到package.json文件，无法验证依赖项安全性',
          recommendation: '确保项目根目录存在package.json文件'
        });
        return;
      }

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      
      // 检查已知的有风险依赖
      const riskyDependencies = [
        'lodash', 'moment', 'request', 'node-sass', 'bower', 'grunt'
      ];

      const allDeps = {
        ...packageJson.dependencies || {},
        ...packageJson.devDependencies || {}
      };

      for (const [dep, version] of Object.entries(allDeps)) {
        const versionStr = String(version);
        
        // 检查是否使用了有风险的依赖
        if (riskyDependencies.includes(dep)) {
          this.addIssue({
            type: 'medium',
            category: 'Dependency Security',
            title: `潜在风险依赖: ${dep}`,
            description: `依赖 ${dep}@${versionStr} 可能存在已知安全漏洞`,
            recommendation: `检查是否有更安全的替代方案，或确保使用最新版本`,
            cweId: 'CWE-1104'
          });
        }

        // 检查版本固定
        if (versionStr.startsWith('^') || versionStr.startsWith('~')) {
          this.addIssue({
            type: 'low',
            category: 'Dependency Security',
            title: `依赖版本不固定: ${dep}`,
            description: `依赖 ${dep} 使用了范围版本 ${versionStr}，可能引入不可预期的更新`,
            recommendation: '考虑使用固定版本号以提高安全性和可重现性'
          });
        }
      }

      // 检查是否使用了 vm2 (安全的JavaScript执行环境)
      if (allDeps['vm2']) {
        this.addIssue({
          type: 'info',
          category: 'Dependency Security',
          title: '使用了安全的JavaScript执行环境',
          description: '项目使用了vm2，这是一个相对安全的JavaScript沙盒执行环境',
          recommendation: '继续使用vm2，并保持更新到最新版本'
        });
      } else {
        this.addIssue({
          type: 'high',
          category: 'Dependency Security',
          title: '缺少安全的JavaScript执行环境',
          description: '项目需要执行用户JavaScript代码但未使用安全的沙盒环境',
          recommendation: '集成vm2或类似的安全JavaScript执行环境',
          cweId: 'CWE-94'
        });
      }

    } catch (error) {
      this.addIssue({
        type: 'medium',
        category: 'Dependency Security',
        title: '依赖项检查失败',
        description: `无法读取或解析package.json: ${error}`,
        recommendation: '检查package.json文件格式是否正确'
      });
    }
  }

  /**
   * 检查源代码安全性
   */
  private async checkSourceCodeSecurity(): Promise<void> {
    console.log('🔍 检查源代码安全性...');

    const sourceFiles = this.getAllSourceFiles(this.srcPath);
    
    for (const filePath of sourceFiles) {
      await this.analyzeSourceFile(filePath);
    }
  }

  /**
   * 分析单个源文件
   */
  private async analyzeSourceFile(filePath: string): Promise<void> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      const relativePath = path.relative(this.srcPath, filePath);

      // 检查各种安全模式
      for (const [category, patterns] of Object.entries(this.suspiciousPatterns)) {
        for (const pattern of patterns) {
          let match;
          while ((match = pattern.exec(content)) !== null) {
            const lineNumber = content.substring(0, match.index).split('\n').length;
            const lineContent = lines[lineNumber - 1]?.trim() || '';

            this.addIssue({
              type: this.getIssueTypeForCategory(category),
              category: 'Code Security',
              title: `潜在的${category}风险`,
              description: `在文件 ${relativePath} 第 ${lineNumber} 行发现可疑模式: ${match[0]}`,
              file: relativePath,
              line: lineNumber,
              recommendation: this.getRecommendationForCategory(category),
              cweId: this.getCWEForCategory(category)
            });
          }
        }
      }

      // 检查特定的安全问题
      this.checkInputValidation(content, relativePath);
      this.checkErrorHandling(content, relativePath);
      this.checkLogging(content, relativePath);
    } catch (error) {
      this.addIssue({
        type: 'low',
        category: 'Code Security',
        title: '文件读取失败',
        description: `无法读取文件 ${filePath}: ${error}`,
        recommendation: '检查文件权限和路径是否正确'
      });
    }
  }

  /**
   * 检查输入验证
   */
  private checkInputValidation(content: string, filePath: string): void {
    const lines = content.split('\n');
    
    // 查找可能缺少输入验证的地方
    const inputPatterns = [
      /req\.(body|query|params)/gi,
      /event\.data/gi,
      /message\.data/gi,
      /JSON\.parse\s*\(/gi
    ];

    for (const pattern of inputPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        const lineContent = lines[lineNumber - 1]?.trim() || '';
        
        // 检查同一行或前几行是否有验证逻辑
        const contextLines = lines.slice(Math.max(0, lineNumber - 3), lineNumber + 2);
        const hasValidation = contextLines.some(line => 
          /validate|check|verify|sanitize|escape/gi.test(line)
        );

        if (!hasValidation) {
          this.addIssue({
            type: 'medium',
            category: 'Input Validation',
            title: '可能缺少输入验证',
            description: `在 ${filePath} 第 ${lineNumber} 行发现未验证的输入处理`,
            file: filePath,
            line: lineNumber,
            recommendation: '添加适当的输入验证和清理逻辑',
            cweId: 'CWE-20'
          });
        }
      }
    }
  }

  /**
   * 检查错误处理
   */
  private checkErrorHandling(content: string, filePath: string): void {
    const lines = content.split('\n');
    
    // 查找可能暴露敏感信息的错误处理
    const errorPatterns = [
      /console\.error\s*\([^)]*error[^)]*\)/gi,
      /console\.log\s*\([^)]*error[^)]*\)/gi,
      /throw\s+new\s+Error\s*\([^)]*\$\{[^}]*\}/gi
    ];

    for (const pattern of errorPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        
        this.addIssue({
          type: 'low',
          category: 'Error Handling',
          title: '可能泄露敏感信息的错误处理',
          description: `在 ${filePath} 第 ${lineNumber} 行发现可能暴露内部信息的错误处理`,
          file: filePath,
          line: lineNumber,
          recommendation: '确保错误信息不包含敏感的系统信息',
          cweId: 'CWE-209'
        });
      }
    }
  }

  /**
   * 检查日志记录
   */
  private checkLogging(content: string, filePath: string): void {
    const lines = content.split('\n');
    
    // 查找可能记录敏感信息的日志
    const logPatterns = [
      /console\.log\s*\([^)]*password[^)]*\)/gi,
      /console\.log\s*\([^)]*token[^)]*\)/gi,
      /console\.log\s*\([^)]*secret[^)]*\)/gi,
      /console\.log\s*\([^)]*key[^)]*\)/gi
    ];

    for (const pattern of logPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        
        this.addIssue({
          type: 'medium',
          category: 'Information Disclosure',
          title: '可能记录敏感信息',
          description: `在 ${filePath} 第 ${lineNumber} 行发现可能记录敏感信息的日志`,
          file: filePath,
          line: lineNumber,
          recommendation: '避免在日志中记录密码、令牌等敏感信息',
          cweId: 'CWE-532'
        });
      }
    }
  }

  /**
   * 检查配置文件安全性
   */
  private async checkConfigurationSecurity(): Promise<void> {
    console.log('⚙️ 检查配置文件安全性...');

    const configFiles = [
      'package.json',
      'tsconfig.json',
      'webpack.config.js',
      '.eslintrc.json',
      '.env',
      '.env.local',
      'vite.config.ts'
    ];

    for (const configFile of configFiles) {
      const configPath = path.join(__dirname, '..', configFile);
      
      if (fs.existsSync(configPath)) {
        const content = fs.readFileSync(configPath, 'utf-8');
        
        // 检查是否包含敏感信息
        const sensitivePatterns = [
          /["']?password["']?\s*:\s*["'][^"']+["']/gi,
          /["']?api[-_]?key["']?\s*:\s*["'][^"']+["']/gi,
          /["']?secret["']?\s*:\s*["'][^"']+["']/gi,
          /["']?token["']?\s*:\s*["'][^"']+["']/gi
        ];

        for (const pattern of sensitivePatterns) {
          if (pattern.test(content)) {
            this.addIssue({
              type: 'high',
              category: 'Configuration Security',
              title: `配置文件包含敏感信息`,
              description: `${configFile} 文件中发现可能的敏感信息`,
              file: configFile,
              recommendation: '将敏感信息移动到环境变量或安全的配置管理系统',
              cweId: 'CWE-798'
            });
          }
        }

        // 特定文件检查
        if (configFile === 'package.json') {
          this.checkPackageJsonSecurity(content);
        }
      }
    }
  }

  /**
   * 检查package.json安全配置
   */
  private checkPackageJsonSecurity(content: string): void {
    try {
      const packageJson = JSON.parse(content);
      
      // 检查scripts中的安全问题
      if (packageJson.scripts) {
        for (const [scriptName, script] of Object.entries(packageJson.scripts)) {
          if (typeof script === 'string') {
            // 检查危险的script命令
            const dangerousCommands = ['rm -rf', 'sudo', 'curl | sh', 'wget | sh'];
            for (const cmd of dangerousCommands) {
              if (script.includes(cmd)) {
                this.addIssue({
                  type: 'high',
                  category: 'Configuration Security',
                  title: `危险的npm script命令`,
                  description: `script "${scriptName}" 包含潜在危险的命令: ${cmd}`,
                  file: 'package.json',
                  recommendation: '审查并移除或替换危险的shell命令',
                  cweId: 'CWE-78'
                });
              }
            }
          }
        }
      }

      // 检查repository字段
      if (!packageJson.repository) {
        this.addIssue({
          type: 'info',
          category: 'Configuration Security',
          title: '缺少repository字段',
          description: 'package.json中缺少repository字段',
          file: 'package.json',
          recommendation: '添加repository字段以提高透明度'
        });
      }

    } catch (error) {
      this.addIssue({
        type: 'medium',
        category: 'Configuration Security',
        title: 'package.json解析失败',
        description: `无法解析package.json: ${error}`,
        file: 'package.json',
        recommendation: '检查package.json语法是否正确'
      });
    }
  }

  /**
   * 检查文件权限
   */
  private async checkFilePermissions(): Promise<void> {
    console.log('🔐 检查文件权限...');

    const criticalFiles = [
      'package.json',
      'tsconfig.json',
      'src/extension/main.ts'
    ];

    for (const file of criticalFiles) {
      const filePath = path.join(__dirname, '..', file);
      
      if (fs.existsSync(filePath)) {
        try {
          const stats = fs.statSync(filePath);
          const mode = stats.mode.toString(8);
          
          // 检查是否有过于宽松的权限
          if (mode.endsWith('777') || mode.endsWith('666')) {
            this.addIssue({
              type: 'medium',
              category: 'File Permissions',
              title: '文件权限过于宽松',
              description: `文件 ${file} 的权限为 ${mode}，可能存在安全风险`,
              file: file,
              recommendation: '设置更严格的文件权限，建议使用644或755',
              cweId: 'CWE-732'
            });
          }
        } catch (error) {
          this.addIssue({
            type: 'low',
            category: 'File Permissions',
            title: '无法检查文件权限',
            description: `无法检查文件 ${file} 的权限: ${error}`,
            file: file,
            recommendation: '手动检查文件权限设置'
          });
        }
      }
    }
  }

  /**
   * 检查网络安全配置
   */
  private async checkNetworkSecurity(): Promise<void> {
    console.log('🌐 检查网络安全配置...');

    const sourceFiles = this.getAllSourceFiles(this.srcPath);
    
    for (const filePath of sourceFiles) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const relativePath = path.relative(this.srcPath, filePath);

        // 检查不安全的网络连接
        const insecurePatterns = [
          /http:\/\/[^'"\s]+/gi,
          /ws:\/\/[^'"\s]+/gi,
          /\.setVerify\s*\(\s*false/gi,
          /rejectUnauthorized\s*:\s*false/gi
        ];

        for (const pattern of insecurePatterns) {
          let match;
          while ((match = pattern.exec(content)) !== null) {
            const lineNumber = content.substring(0, match.index).split('\n').length;
            
            this.addIssue({
              type: 'medium',
              category: 'Network Security',
              title: '不安全的网络连接',
              description: `在 ${relativePath} 第 ${lineNumber} 行发现不安全的网络配置`,
              file: relativePath,
              line: lineNumber,
              recommendation: '使用HTTPS/WSS协议，启用证书验证',
              cweId: 'CWE-319'
            });
          }
        }

        // 检查硬编码的URL或IP
        const hardcodedPatterns = [
          /https?:\/\/\d+\.\d+\.\d+\.\d+/gi,
          /https?:\/\/localhost/gi
        ];

        for (const pattern of hardcodedPatterns) {
          if (pattern.test(content)) {
            this.addIssue({
              type: 'low',
              category: 'Network Security',
              title: '硬编码的网络地址',
              description: `在 ${relativePath} 中发现硬编码的网络地址`,
              file: relativePath,
              recommendation: '使用配置文件或环境变量管理网络地址',
              cweId: 'CWE-798'
            });
          }
        }
      } catch (error) {
        // 忽略读取错误
      }
    }
  }

  /**
   * 生成总体评估
   */
  private generateOverallAssessment(): void {
    // 统计各级别问题数量
    for (const issue of this.report.issues) {
      this.report.summary.total++;
      this.report.summary[issue.type]++;
    }

    // 确定总体安全状态
    if (this.report.summary.critical > 0 || this.report.summary.high > 2) {
      this.report.overall = 'vulnerable';
    } else if (this.report.summary.high > 0 || this.report.summary.medium > 5) {
      this.report.overall = 'warning';
    } else {
      this.report.overall = 'secure';
    }

    // 生成建议
    this.generateSecurityRecommendations();
  }

  /**
   * 生成安全建议
   */
  private generateSecurityRecommendations(): void {
    const recommendations: string[] = [];

    if (this.report.summary.critical > 0) {
      recommendations.push('🚨 立即修复所有关键安全问题');
    }

    if (this.report.summary.high > 0) {
      recommendations.push('⚠️ 优先修复高风险安全问题');
    }

    if (this.report.issues.some(issue => issue.category === 'Dependency Security')) {
      recommendations.push('📦 定期更新依赖项并进行安全扫描');
    }

    if (this.report.issues.some(issue => issue.category === 'Input Validation')) {
      recommendations.push('🔍 加强输入验证和数据清理');
    }

    if (this.report.issues.some(issue => issue.category === 'Code Security')) {
      recommendations.push('🛡️ 实施安全的编码实践');
    }

    if (this.report.issues.some(issue => issue.category === 'Configuration Security')) {
      recommendations.push('⚙️ 审查并加固配置文件');
    }

    // 通用建议
    recommendations.push('🔒 实施定期安全审查流程');
    recommendations.push('📚 为团队提供安全培训');
    recommendations.push('🔧 集成自动化安全检测工具');

    if (recommendations.length === 0) {
      recommendations.push('✅ 未发现严重安全问题，继续保持良好的安全实践');
    }

    this.report.recommendations = recommendations;
  }

  /**
   * 添加安全问题
   */
  private addIssue(issue: SecurityIssue): void {
    this.report.issues.push(issue);
  }

  /**
   * 获取所有源文件
   */
  private getAllSourceFiles(dir: string): string[] {
    const files: string[] = [];
    
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          files.push(...this.getAllSourceFiles(fullPath));
        } else if (entry.isFile() && /\.(ts|js|vue|json)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // 忽略读取错误
    }
    
    return files;
  }

  /**
   * 根据类别获取问题类型
   */
  private getIssueTypeForCategory(category: string): 'critical' | 'high' | 'medium' | 'low' {
    const typeMap: { [key: string]: 'critical' | 'high' | 'medium' | 'low' } = {
      'SQL Injection': 'critical',
      'Command Injection': 'critical',
      'XSS Vulnerabilities': 'high',
      'Path Traversal': 'high',
      'Sensitive Data Exposure': 'high',
      'Unsafe Crypto': 'medium',
      'File System Risks': 'medium'
    };
    
    return typeMap[category] || 'low';
  }

  /**
   * 根据类别获取建议
   */
  private getRecommendationForCategory(category: string): string {
    const recommendations: { [key: string]: string } = {
      'SQL Injection': '使用参数化查询和ORM，避免字符串拼接',
      'Command Injection': '避免执行外部命令，使用安全的API替代',
      'XSS Vulnerabilities': '对所有用户输入进行转义和验证',
      'Path Traversal': '使用安全的路径处理函数，验证文件路径',
      'Sensitive Data Exposure': '使用环境变量或安全的密钥管理系统',
      'Unsafe Crypto': '使用现代的加密算法（如AES-256, SHA-256等）',
      'File System Risks': '限制文件系统访问权限，验证文件操作'
    };
    
    return recommendations[category] || '请遵循安全的编码实践';
  }

  /**
   * 根据类别获取CWE ID
   */
  private getCWEForCategory(category: string): string {
    const cweMap: { [key: string]: string } = {
      'SQL Injection': 'CWE-89',
      'Command Injection': 'CWE-78',
      'XSS Vulnerabilities': 'CWE-79',
      'Path Traversal': 'CWE-22',
      'Sensitive Data Exposure': 'CWE-200',
      'Unsafe Crypto': 'CWE-327',
      'File System Risks': 'CWE-732'
    };
    
    return cweMap[category] || '';
  }

  /**
   * 生成安全审查报告
   */
  generateReport(): string {
    const { overall, summary, issues, recommendations } = this.report;
    
    let report = `
# 安全性审查报告

## 总体安全状态: ${this.getStatusIcon()} ${overall.toUpperCase()}

## 问题统计

| 级别 | 数量 | 说明 |
|------|------|------|
| 🔴 关键 | ${summary.critical} | 需要立即修复的严重安全漏洞 |
| 🟡 高风险 | ${summary.high} | 高优先级安全问题 |
| 🟠 中风险 | ${summary.medium} | 中等优先级安全问题 |
| 🔵 低风险 | ${summary.low} | 建议修复的安全问题 |
| ℹ️ 信息 | ${summary.info} | 安全信息和建议 |
| **总计** | **${summary.total}** | **发现的问题总数** |

## 详细问题清单

`;

    if (issues.length === 0) {
      report += '✅ 未发现安全问题\n\n';
    } else {
      // 按严重程度排序
      const sortedIssues = issues.sort((a, b) => {
        const severity = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
        return severity[b.type] - severity[a.type];
      });

      for (const issue of sortedIssues) {
        report += `### ${this.getIssueIcon(issue.type)} ${issue.title}

- **级别**: ${issue.type.toUpperCase()}
- **类别**: ${issue.category}
- **描述**: ${issue.description}`;

        if (issue.file) {
          report += `\n- **文件**: ${issue.file}`;
        }
        
        if (issue.line) {
          report += `\n- **行号**: ${issue.line}`;
        }
        
        if (issue.cweId) {
          report += `\n- **CWE ID**: ${issue.cweId}`;
        }

        report += `\n- **建议**: ${issue.recommendation}

`;
      }
    }

    report += `## 安全建议

${recommendations.map(rec => `- ${rec}`).join('\n')}

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

- **审查时间**: ${new Date(this.report.timestamp).toLocaleString('zh-CN')}
- **审查范围**: 源代码、配置文件、依赖项
- **审查工具**: 自动化安全扫描

---
*此报告由自动化安全审查生成，建议结合手动安全测试*
`;

    return report;
  }

  private getStatusIcon(): string {
    switch (this.report.overall) {
      case 'secure': return '✅';
      case 'warning': return '⚠️';
      case 'vulnerable': return '🚨';
      default: return '❓';
    }
  }

  private getIssueIcon(type: string): string {
    switch (type) {
      case 'critical': return '🔴';
      case 'high': return '🟡';
      case 'medium': return '🟠';
      case 'low': return '🔵';
      case 'info': return 'ℹ️';
      default: return '❓';
    }
  }
}

// 执行安全审查
async function main() {
  try {
    const auditor = new SecurityAuditor();
    const report = await auditor.performAudit();
    
    console.log('\n' + auditor.generateReport());
    
    // 保存报告到文件
    const reportPath = path.join(__dirname, '../reports/security-audit-report.md');
    const reportsDir = path.dirname(reportPath);
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, auditor.generateReport());
    console.log(`\n📄 安全审查报告已保存到: ${reportPath}`);
    
    // 返回适当的退出代码
    process.exit(report.overall === 'vulnerable' ? 1 : 0);
  } catch (error) {
    console.error('❌ 安全审查过程中发生错误:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { SecurityAuditor, type SecurityReport };
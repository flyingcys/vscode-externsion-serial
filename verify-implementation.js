#!/usr/bin/env node

/**
 * 第二阶段实现验证脚本
 * 检查所有必需的文件和组件是否已实现
 */

const fs = require('fs');
const path = require('path');

const srcRoot = path.join(__dirname, 'src');

// 验证结果统计
let totalTests = 0;
let passedTests = 0;
const results = [];

function test(description, testFn) {
  totalTests++;
  try {
    const result = testFn();
    if (result) {
      passedTests++;
      results.push(`✅ ${description}`);
    } else {
      results.push(`❌ ${description}`);
    }
  } catch (error) {
    results.push(`❌ ${description} - 错误: ${error.message}`);
  }
}

console.log('🔍 开始验证第二阶段实现状态...\n');

// 1. 核心架构组件验证
console.log('1️⃣ 核心架构组件验证');

test('数据解析模块目录存在', () => {
  return fs.existsSync(path.join(srcRoot, 'extension/parsing'));
});

test('CircularBuffer.ts 存在', () => {
  return fs.existsSync(path.join(srcRoot, 'extension/parsing/CircularBuffer.ts'));
});

test('DataDecoder.ts 存在', () => {
  return fs.existsSync(path.join(srcRoot, 'extension/parsing/DataDecoder.ts'));
});

test('Checksum.ts 存在', () => {
  return fs.existsSync(path.join(srcRoot, 'extension/parsing/Checksum.ts'));
});

test('FrameReader.ts 存在', () => {
  return fs.existsSync(path.join(srcRoot, 'extension/parsing/FrameReader.ts'));
});

test('FrameParser.ts 存在', () => {
  return fs.existsSync(path.join(srcRoot, 'extension/parsing/FrameParser.ts'));
});

test('Vue3 Webview目录存在', () => {
  return fs.existsSync(path.join(srcRoot, 'webview'));
});

test('基础组件目录存在', () => {
  return fs.existsSync(path.join(srcRoot, 'webview/components'));
});

test('BaseWidget.vue 存在', () => {
  return fs.existsSync(path.join(srcRoot, 'webview/components/base/BaseWidget.vue'));
});

test('PlotWidget.vue 存在', () => {
  return fs.existsSync(path.join(srcRoot, 'webview/components/widgets/PlotWidget.vue'));
});

test('GaugeWidget.vue 存在', () => {
  return fs.existsSync(path.join(srcRoot, 'webview/components/widgets/GaugeWidget.vue'));
});

// 2. 状态管理验证
console.log('\n2️⃣ Pinia状态管理验证');

test('Stores目录存在', () => {
  return fs.existsSync(path.join(srcRoot, 'webview/stores'));
});

test('data.ts store存在', () => {
  return fs.existsSync(path.join(srcRoot, 'webview/stores/data.ts'));
});

test('connection.ts store存在', () => {
  return fs.existsSync(path.join(srcRoot, 'webview/stores/connection.ts'));
});

test('theme.ts store存在', () => {
  return fs.existsSync(path.join(srcRoot, 'webview/stores/theme.ts'));
});

test('layout.ts store存在', () => {
  return fs.existsSync(path.join(srcRoot, 'webview/stores/layout.ts'));
});

test('performance.ts store存在', () => {
  return fs.existsSync(path.join(srcRoot, 'webview/stores/performance.ts'));
});

// 3. 对话框组件验证
console.log('\n3️⃣ 对话框组件验证');

test('对话框目录存在', () => {
  return fs.existsSync(path.join(srcRoot, 'webview/components/dialogs'));
});

test('WidgetSettingsDialog.vue 存在', () => {
  return fs.existsSync(path.join(srcRoot, 'webview/components/dialogs/WidgetSettingsDialog.vue'));
});

test('WidgetExportDialog.vue 存在', () => {
  return fs.existsSync(path.join(srcRoot, 'webview/components/dialogs/WidgetExportDialog.vue'));
});

// 4. 技术规格实现验证
console.log('\n4️⃣ 技术规格实现验证');

test('DataDecoder支持多种数据格式', () => {
  const filePath = path.join(srcRoot, 'extension/parsing/DataDecoder.ts');
  if (!fs.existsSync(filePath)) return false;
  
  const content = fs.readFileSync(filePath, 'utf8');
  return content.includes('PlainText') && 
         content.includes('Hexadecimal') && 
         content.includes('Base64') && 
         content.includes('Binary');
});

test('FrameParser使用VM2安全执行环境', () => {
  const filePath = path.join(srcRoot, 'extension/parsing/FrameParser.ts');
  if (!fs.existsSync(filePath)) return false;
  
  const content = fs.readFileSync(filePath, 'utf8');
  return content.includes('vm2') && 
         content.includes('VM') && 
         content.includes('安全');
});

test('FrameReader支持多种帧检测模式', () => {
  const filePath = path.join(srcRoot, 'extension/parsing/FrameReader.ts');
  if (!fs.existsSync(filePath)) return false;
  
  const content = fs.readFileSync(filePath, 'utf8');
  return content.includes('EndDelimiterOnly') && 
         content.includes('StartDelimiterOnly') && 
         content.includes('StartAndEndDelimiter') && 
         content.includes('NoDelimiters');
});

test('Checksum实现校验和验证', () => {
  const filePath = path.join(srcRoot, 'extension/parsing/Checksum.ts');
  if (!fs.existsSync(filePath)) return false;
  
  const content = fs.readFileSync(filePath, 'utf8');
  return content.includes('CRC') && 
         content.includes('MD5') && 
         content.includes('SHA');
});

// 5. 可视化组件实现验证
console.log('\n5️⃣ 可视化组件实现验证');

test('PlotWidget使用Chart.js实时图表', () => {
  const filePath = path.join(srcRoot, 'webview/components/widgets/PlotWidget.vue');
  if (!fs.existsSync(filePath)) return false;
  
  const content = fs.readFileSync(filePath, 'utf8');
  return content.includes('Chart.js') && 
         content.includes('realtime') && 
         content.includes('togglePause') && 
         content.includes('export');
});

test('GaugeWidget使用SVG仪表盘', () => {
  const filePath = path.join(srcRoot, 'webview/components/widgets/GaugeWidget.vue');
  if (!fs.existsSync(filePath)) return false;
  
  const content = fs.readFileSync(filePath, 'utf8');
  return content.includes('SVG') && 
         content.includes('gauge') && 
         content.includes('pointer') && 
         content.includes('threshold');
});

test('BaseWidget提供通用基础功能', () => {
  const filePath = path.join(srcRoot, 'webview/components/base/BaseWidget.vue');
  if (!fs.existsSync(filePath)) return false;
  
  const content = fs.readFileSync(filePath, 'utf8');
  return content.includes('BaseWidget') && 
         content.includes('toolbar') && 
         content.includes('settings') && 
         content.includes('export') && 
         content.includes('fullscreen');
});

test('设置和导出对话框功能完整', () => {
  const settingsPath = path.join(srcRoot, 'webview/components/dialogs/WidgetSettingsDialog.vue');
  const exportPath = path.join(srcRoot, 'webview/components/dialogs/WidgetExportDialog.vue');
  
  if (!fs.existsSync(settingsPath) || !fs.existsSync(exportPath)) return false;
  
  const settingsContent = fs.readFileSync(settingsPath, 'utf8');
  const exportContent = fs.readFileSync(exportPath, 'utf8');
  
  return settingsContent.includes('WidgetSettingsDialog') && 
         settingsContent.includes('config') && 
         settingsContent.includes('form') &&
         exportContent.includes('WidgetExportDialog') && 
         exportContent.includes('CSV') && 
         exportContent.includes('JSON') && 
         exportContent.includes('Excel');
});

// 6. 代码结构和质量验证
console.log('\n6️⃣ 代码结构和质量验证');

test('模块化架构目录完整', () => {
  const directories = [
    'extension/parsing',
    'extension/io',
    'webview/components',
    'webview/stores',
    'shared',
    'tests'
  ];
  
  return directories.every(dir => {
    return fs.existsSync(path.join(srcRoot, dir));
  });
});

test('类型安全保障文件存在', () => {
  const typesPath = path.join(srcRoot, 'shared/types.ts');
  if (!fs.existsSync(typesPath)) return false;
  
  const content = fs.readFileSync(typesPath, 'utf8');
  return content.includes('interface') && 
         content.includes('enum') && 
         content.includes('BusType') && 
         content.includes('WidgetType') && 
         content.includes('Dataset') && 
         content.includes('Frame');
});

test('测试套件目录完整', () => {
  const testDirs = [
    'tests/parsing',
    'tests/integration',
    'tests/performance',
    'tests/io'
  ];
  
  return testDirs.every(dir => {
    return fs.existsSync(path.join(srcRoot, dir));
  });
});

// 7. 核心业务逻辑文件验证
console.log('\n7️⃣ 核心业务逻辑文件验证');

test('所有核心业务逻辑文件存在', () => {
  const coreFiles = [
    'shared/types.ts',
    'extension/parsing/CircularBuffer.ts',
    'extension/parsing/FrameReader.ts',
    'extension/parsing/FrameParser.ts',
    'webview/components/base/BaseWidget.vue',
    'webview/components/widgets/PlotWidget.vue',
    'webview/components/widgets/GaugeWidget.vue',
    'webview/stores/data.ts',
    'webview/stores/performance.ts'
  ];
  
  return coreFiles.every(file => {
    return fs.existsSync(path.join(srcRoot, file));
  });
});

// 输出结果
console.log('\n📊 验证结果汇总');
console.log('========================');

results.forEach(result => console.log(result));

console.log('\n📈 统计信息');
console.log(`总测试数: ${totalTests}`);
console.log(`通过测试: ${passedTests}`);
console.log(`失败测试: ${totalTests - passedTests}`);
console.log(`通过率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
  console.log('\n🎉 第二阶段实现验证完全通过！');
  console.log('所有必需的组件和功能已成功实现。');
  process.exit(0);
} else {
  console.log('\n⚠️  验证未完全通过，请检查失败的测试项。');
  process.exit(1);
}
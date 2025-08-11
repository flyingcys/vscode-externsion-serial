#!/usr/bin/env python3
"""
VSCode Serial Studio 插件测试覆盖深度分析脚本
"""

import os
import re
from collections import defaultdict
from pathlib import Path

def collect_source_files(src_dir):
    """收集所有源文件"""
    source_files = []
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith('.ts') and not file.endswith('.d.ts'):
                rel_path = os.path.relpath(os.path.join(root, file), src_dir)
                source_files.append(rel_path)
            elif file.endswith('.vue'):
                rel_path = os.path.relpath(os.path.join(root, file), src_dir)
                source_files.append(rel_path)
    return sorted(source_files)

def collect_test_files(test_dir):
    """收集所有测试文件"""
    test_files = []
    for root, dirs, files in os.walk(test_dir):
        for file in files:
            if file.endswith('.test.ts'):
                rel_path = os.path.relpath(os.path.join(root, file), test_dir)
                test_files.append(rel_path)
    return sorted(test_files)

def analyze_coverage():
    """分析测试覆盖情况"""
    base_dir = "/home/share/samba/vscode-extension/serial-visual/vscode-externsion-serial"
    src_dir = os.path.join(base_dir, "src")
    test_dir = os.path.join(base_dir, "utest")
    
    source_files = collect_source_files(src_dir)
    test_files = collect_test_files(test_dir)
    
    print("# VSCode Serial Studio 插件测试覆盖深度分析报告")
    print()
    print("## 总体统计")
    print(f"- 源文件总数: {len(source_files)}")
    print(f"- 测试文件总数: {len(test_files)}")
    print(f"- 测试/源文件比例: {len(test_files)/len(source_files):.2f}:1")
    print()
    
    # 按模块分类统计
    source_by_module = defaultdict(list)
    test_by_module = defaultdict(list)
    
    for src in source_files:
        if src.startswith('extension/'):
            module = src.split('/')[1] if '/' in src else 'extension'
            source_by_module[f"extension/{module}"].append(src)
        elif src.startswith('webview/'):
            module = src.split('/')[1] if '/' in src else 'webview'
            source_by_module[f"webview/{module}"].append(src)
        elif src.startswith('shared/'):
            source_by_module['shared'].append(src)
        elif src.startswith('workers/'):
            source_by_module['workers'].append(src)
        else:
            source_by_module['other'].append(src)
    
    for test in test_files:
        module = test.split('/')[0]
        test_by_module[module].append(test)
    
    print("## 按模块分析")
    print()
    
    # 详细分析每个模块
    missing_tests = []
    low_coverage_modules = []
    
    # extension 模块分析
    print("### Extension 模块")
    extension_sources = [f for f in source_files if f.startswith('extension/')]
    extension_tests = [f for f in test_files if any(test_module in f for test_module in ['extension/', 'communication/', 'export/', 'io/', 'mqtt/', 'parsing/', 'plugins/', 'project/'])]
    
    print(f"- 源文件数: {len(extension_sources)}")
    print(f"- 测试文件数: {len(extension_tests)}")
    print()
    
    # 检查缺失的重要文件测试
    critical_files = [
        'extension/main.ts',
        'extension/export/exporters/CSVExporter.ts',
        'extension/export/exporters/ExcelExporter.ts', 
        'extension/export/exporters/JSONExporter.ts',
        'extension/export/exporters/XMLExporter.ts',
        'extension/webview/ProjectEditorProvider.ts',
        'extension/project/ProjectValidator.ts',
        'extension/licensing/LicenseManager.ts',
        'extension/licensing/FeatureGate.ts',
    ]
    
    print("#### 关键文件测试覆盖情况")
    for critical_file in critical_files:
        if critical_file in extension_sources:
            # 检查是否有对应测试
            file_name = os.path.basename(critical_file).replace('.ts', '')
            has_test = any(file_name in test for test in extension_tests)
            status = "✓ 有测试" if has_test else "✗ 缺少测试"
            print(f"- {critical_file}: {status}")
            if not has_test:
                missing_tests.append(critical_file)
    print()
    
    # webview 模块分析
    print("### Webview 模块")
    webview_sources = [f for f in source_files if f.startswith('webview/')]
    webview_tests = [f for f in test_files if f.startswith('webview/') or f.startswith('visualization/')]
    
    print(f"- 源文件数: {len(webview_sources)}")
    print(f"- 测试文件数: {len(webview_tests)}")
    
    # Vue 组件测试覆盖分析
    vue_files = [f for f in webview_sources if f.endswith('.vue')]
    print(f"- Vue 组件数: {len(vue_files)}")
    
    widget_files = [f for f in vue_files if 'widgets/' in f]
    print(f"- Widget 组件数: {len(widget_files)}")
    
    dialog_files = [f for f in vue_files if 'dialogs/' in f]
    print(f"- Dialog 组件数: {len(dialog_files)}")
    
    print()
    print("#### 缺少测试的 Vue 组件:")
    vue_missing_tests = []
    for vue_file in vue_files:
        component_name = os.path.basename(vue_file).replace('.vue', '')
        has_test = any(component_name in test for test in webview_tests)
        if not has_test:
            vue_missing_tests.append(vue_file)
            print(f"- {vue_file}")
    print()
    
    # shared 模块分析  
    print("### Shared 模块")
    shared_sources = [f for f in source_files if f.startswith('shared/')]
    shared_tests = [f for f in test_files if f.startswith('shared/') or f.startswith('performance/')]
    
    print(f"- 源文件数: {len(shared_sources)}")
    print(f"- 测试文件数: {len(shared_tests)}")
    print()
    
    # workers 模块分析
    print("### Workers 模块") 
    workers_sources = [f for f in source_files if f.startswith('workers/')]
    workers_tests = [f for f in test_files if f.startswith('workers/')]
    
    print(f"- 源文件数: {len(workers_sources)}")
    print(f"- 测试文件数: {len(workers_tests)}")
    print()
    
    # 生成优先级建议
    print("## 测试补充优先级建议")
    print()
    
    print("### 高优先级 (核心业务逻辑)")
    high_priority = [
        'extension/export/exporters/CSVExporter.ts',
        'extension/export/exporters/ExcelExporter.ts',
        'extension/export/exporters/JSONExporter.ts', 
        'extension/export/exporters/XMLExporter.ts',
        'extension/webview/ProjectEditorProvider.ts',
        'extension/project/ProjectValidator.ts',
        'extension/licensing/LicenseManager.ts',
    ]
    
    for item in high_priority:
        if item in missing_tests:
            print(f"- {item}")
    print()
    
    print("### 中优先级 (用户界面组件)")
    medium_priority_vue = vue_missing_tests[:10]  # 前10个最重要的组件
    for item in medium_priority_vue:
        print(f"- {item}")
    print()
    
    print("### 低优先级 (辅助功能)")
    # 其他缺失的文件
    print()
    
    print("## 重复和冗余测试分析")
    
    # 分析重复测试
    test_name_counts = defaultdict(list)
    for test_file in test_files:
        # 提取基础测试名称
        base_name = os.path.basename(test_file).replace('.test.ts', '')
        # 移除版本后缀
        clean_name = re.sub(r'-(Real|Simple|Ultimate|Coverage|Enhanced|Boost|100|Percent|Part\d+|Final).*', '', base_name)
        test_name_counts[clean_name].append(test_file)
    
    duplicates = {k: v for k, v in test_name_counts.items() if len(v) > 1}
    
    print(f"- 发现 {len(duplicates)} 个模块有多个测试版本")
    
    for base_name, variants in list(duplicates.items())[:5]:  # 显示前5个
        print(f"  - {base_name}: {len(variants)} 个版本")
        for variant in variants:
            print(f"    - {variant}")
    print()
    
    print("## 总结和建议")
    print()
    print(f"1. **缺少测试的关键文件**: {len(missing_tests)} 个")
    print(f"2. **缺少测试的Vue组件**: {len(vue_missing_tests)} 个") 
    print(f"3. **重复测试模块**: {len(duplicates)} 个")
    print(f"4. **当前测试覆盖率**: 仅 0.97% (根据覆盖报告)")
    print()
    print("### 立即行动建议")
    print("1. 优先为 4 个 Exporter 类创建完整测试")
    print("2. 为核心的 ProjectValidator 和 LicenseManager 补充测试") 
    print("3. 为 13 个主要 Widget 组件创建基础测试")
    print("4. 清理重复的测试文件，每个模块保留最佳版本")
    print("5. 建立测试覆盖率目标：短期达到 60%，中期达到 85%")

if __name__ == "__main__":
    analyze_coverage()
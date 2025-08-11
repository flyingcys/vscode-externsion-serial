#!/bin/bash

##
# Git Pre-Commit Hook: 测试质量检查
# 防止重复和低质量测试文件的提交
##

set -e

echo "🔍 执行测试质量检查..."

# 检查是否存在质量监控脚本
if [ ! -f "test-quality-monitor.js" ]; then
  echo "⚠️  未找到test-quality-monitor.js，跳过质量检查"
  exit 0
fi

# 获取即将提交的测试文件
STAGED_TEST_FILES=$(git diff --cached --name-only --diff-filter=A | grep '\.test\.ts$' || true)

if [ -z "$STAGED_TEST_FILES" ]; then
  echo "✅ 没有新的测试文件，跳过检查"
  exit 0
fi

echo "📁 发现新测试文件:"
echo "$STAGED_TEST_FILES"

# 检查是否包含禁止的文件名模式
FORBIDDEN_PATTERNS=(
  "-Ultimate"
  "-Enhanced" 
  "-Coverage-Boost"
  "-100Percent"
  "-Final"
  "-Part2" 
  "-Optimized"
  "-Production"
  "-Simple"
)

VIOLATIONS_FOUND=false

for file in $STAGED_TEST_FILES; do
  for pattern in "${FORBIDDEN_PATTERNS[@]}"; do
    if [[ "$file" == *"$pattern"* ]]; then
      echo "❌ 禁止的测试文件命名模式: $file (包含 $pattern)"
      VIOLATIONS_FOUND=true
    fi
  done
  
  # 检查是否导入真实源代码
  if [ -f "$file" ]; then
    if ! grep -qE "@(extension|shared|webview|workers)/|from [\"']\\.\\./|require\\([\"']\\.\\." "$file"; then
      echo "⚠️  测试文件可能未导入真实源代码: $file"
      echo "   建议确保导入真实模块而非mock对象"
    fi
  fi
done

# 检查重复文件
echo ""
echo "🔍 检查重复测试文件..."

for file in $STAGED_TEST_FILES; do
  # 获取基础名称
  basename_file=$(basename "$file" .test.ts)
  basename_clean=$(echo "$basename_file" | sed -E 's/-Real$|-(Ultimate|Enhanced|Coverage-Boost|100Percent|Final|Part[0-9]+|Optimized|Production|Simple|Fixed).*$//')
  
  # 查找可能的重复
  existing_files=$(find utest -name "*${basename_clean}*.test.ts" -not -path "*/$file" 2>/dev/null || true)
  
  if [ ! -z "$existing_files" ]; then
    echo "⚠️  可能的重复测试文件:"
    echo "   新文件: $file"
    echo "   现有文件:"
    echo "$existing_files" | sed 's/^/     /'
    echo ""
  fi
done

if [ "$VIOLATIONS_FOUND" = true ]; then
  echo ""
  echo "❌ 测试质量检查失败!"
  echo ""
  echo "🚫 禁止的文件命名模式:"
  printf "   %s\n" "${FORBIDDEN_PATTERNS[@]}"
  echo ""
  echo "✅ 推荐的命名模式:"
  echo "   - ModuleName-Real.test.ts (测试真实源代码)"
  echo "   - ModuleName.test.ts (基础测试)"
  echo ""
  echo "💡 解决方案:"
  echo "   1. 重命名测试文件使用推荐模式"
  echo "   2. 确保测试导入并执行真实源代码"
  echo "   3. 避免创建功能重复的测试文件"
  echo ""
  exit 1
fi

echo ""
echo "✅ 测试质量检查通过"
exit 0
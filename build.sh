#!/bin/bash

# Serial Studio VSCode 插件构建脚本
# 用法: ./build.sh [build|install|clean|help]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目配置
EXTENSION_NAME="serial-studio-vscode"
DISPLAY_NAME="Serial Studio"

# 获取版本号
get_version() {
    if [ -f "package.json" ]; then
        VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "1.0.0")
    else
        VERSION="1.0.0"
    fi
    echo $VERSION
}

# 辅助函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查必要工具
check_dependencies() {
    log_info "检查构建依赖..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装，请先安装 Node.js"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装，请先安装 npm"
        exit 1
    fi
    
    # 检查 Node.js 版本
    NODE_VERSION=$(node --version | sed 's/v//')
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d. -f1)
    if [ "$MAJOR_VERSION" -lt 18 ]; then
        log_error "Node.js 版本过低 (当前: $NODE_VERSION)，请安装 Node.js 18+ 版本"
        exit 1
    fi
    
    if ! command -v code &> /dev/null; then
        log_warning "VSCode CLI 未找到，将无法自动安装插件"
    fi
    
    # 检查项目必要文件
    if [ ! -f "package.json" ]; then
        log_error "package.json 文件不存在"
        exit 1
    fi
    
    if [ ! -f "tsconfig.json" ]; then
        log_error "tsconfig.json 文件不存在"
        exit 1
    fi
    
    if [ ! -f "webpack.config.js" ]; then
        log_error "webpack.config.js 文件不存在"
        exit 1
    fi
    
    if [ ! -d "src" ]; then
        log_error "src 目录不存在"
        exit 1
    fi
    
    log_success "依赖检查完成 (Node.js: v$NODE_VERSION)"
}

# 安装依赖
install_dependencies() {
    log_info "安装项目依赖..."
    
    # 清理 npm 缓存
    npm cache clean --force >/dev/null 2>&1 || true
    
    # 安装依赖
    npm install
    log_success "依赖安装完成"
}

# 编译项目
compile_project() {
    log_info "编译 TypeScript 项目..."
    npm run compile
    log_success "编译完成"
}

# 运行代码检查
run_lint() {
    log_info "运行代码检查..."
    if npm run lint; then
        log_success "代码检查通过"
    else
        log_warning "代码检查发现问题，但将继续构建"
        log_info "请查看上方的 ESLint 输出以了解具体问题"
    fi
}

# 运行类型检查
run_typecheck() {
    log_info "运行 TypeScript 类型检查..."
    if npm run type-check; then
        log_success "类型检查通过"
    else
        log_warning "类型检查发现问题，但将继续构建"
        log_info "请查看上方的 TypeScript 输出以了解具体问题"
    fi
}

# 验证扩展配置文件
validate_extension_files() {
    log_info "验证扩展配置文件..."
    
    # 检查核心模块目录
    if [ -d "src/extension" ]; then
        EXTENSION_COUNT=$(find src/extension -name "*.ts" | wc -l)
        log_info "找到 ${EXTENSION_COUNT} 个扩展后端文件"
    else
        log_warning "未找到扩展后端模块目录"
    fi
    
    if [ -d "src/webview" ]; then
        WEBVIEW_COUNT=$(find src/webview -name "*.vue" -o -name "*.ts" | wc -l)
        log_info "找到 ${WEBVIEW_COUNT} 个前端视图文件"
    else
        log_warning "未找到前端视图目录"
    fi
    
    if [ -d "src/shared" ]; then
        SHARED_COUNT=$(find src/shared -name "*.ts" | wc -l)
        log_info "找到 ${SHARED_COUNT} 个共享模块文件"
    else
        log_warning "未找到共享模块目录"
    fi
    
    if [ -d "src/workers" ]; then
        WORKER_COUNT=$(find src/workers -name "*.ts" | wc -l)
        log_info "找到 ${WORKER_COUNT} 个 Worker 文件"
    else
        log_warning "未找到 Worker 目录"
    fi
    
    # 检查是否排除了测试目录
    if grep -q "utest" tsconfig.json; then
        log_success "已正确排除 utest 测试目录"
    else
        log_warning "未在 tsconfig.json 中排除 utest 目录"
    fi
    
    log_success "扩展配置文件验证完成"
}

# 打包扩展
package_extension() {
    log_info "打包 VSCode 扩展..."
    
    # 使用 webpack 生产模式打包
    npm run package
    
    # 获取版本号并生成带版本的文件名
    VERSION=$(get_version)
    VERSIONED_NAME="${EXTENSION_NAME}-${VERSION}.vsix"
    
    # 使用 vsce 打包
    if npm run vsce:package; then
        log_success "扩展打包完成"
        
        # 检查是否生成了.vsix文件
        VSIX_FILE=$(find . -name "*.vsix" -type f | head -1)
        if [ -n "$VSIX_FILE" ]; then
            # 如果文件名不是我们期望的版本名，重命名它
            if [ "$VSIX_FILE" != "./$VERSIONED_NAME" ]; then
                mv "$VSIX_FILE" "$VERSIONED_NAME"
                log_info "重命名打包文件为: ${VERSIONED_NAME}"
            fi
            
            # 创建最新版本的符号链接（可选）
            ln -sf "${VERSIONED_NAME}" "${EXTENSION_NAME}-latest.vsix"
            log_info "创建符号链接: ${EXTENSION_NAME}-latest.vsix -> ${VERSIONED_NAME}"
            
            # 显示文件大小
            FILE_SIZE=$(du -h "$VERSIONED_NAME" | cut -f1)
            log_success "扩展包大小: ${FILE_SIZE}"
        else
            log_error "未找到生成的.vsix文件"
            exit 1
        fi
    else
        log_error "扩展打包失败"
        exit 1
    fi
}

# 安装扩展到 VSCode
install_extension() {
    log_info "安装扩展到 VSCode..."
    
    if ! command -v code &> /dev/null; then
        log_error "VSCode CLI 未找到，请手动安装 .vsix 文件"
        log_info "手动安装方法: VSCode -> 扩展 -> ... -> 从 VSIX 安装..."
        return 1
    fi
    
    # 优先查找最新版本链接，然后查找版本化文件
    VERSION=$(get_version)
    VERSIONED_NAME="${EXTENSION_NAME}-${VERSION}.vsix"
    LATEST_LINK="${EXTENSION_NAME}-latest.vsix"
    
    VSIX_FILE=""
    if [ -f "$LATEST_LINK" ]; then
        VSIX_FILE="$LATEST_LINK"
    elif [ -f "$VERSIONED_NAME" ]; then
        VSIX_FILE="$VERSIONED_NAME"
    else
        # 回退到查找任何匹配的文件
        VSIX_FILE=$(find . -name "${EXTENSION_NAME}*.vsix" -type f | head -1)
    fi
    
    if [ -z "$VSIX_FILE" ]; then
        log_error "未找到 .vsix 文件，请先运行构建"
        log_info "预期文件名: ${VERSIONED_NAME}"
        return 1
    fi
    
    # 安装扩展
    log_info "安装文件: $VSIX_FILE"
    code --install-extension "$VSIX_FILE" --force
    log_success "扩展安装完成"
    log_info "请重启 VSCode 以使扩展生效"
}

# 清理 VSCode 全局缓存
clean_vscode_cache() {
    log_info "清理 VSCode 全局缓存..."
    
    # VSCode 缓存目录列表
    VSCODE_CACHE_DIRS=(
        "$HOME/.vscode/CachedExtensions"
        "$HOME/.vscode/CachedExtensionVSIXs"
        "$HOME/.vscode/logs"
        "$HOME/.vscode/extensions/.obsolete"
        "$HOME/.cache/vscode"
        "$HOME/.cache/vscode-cpptools"
        "$HOME/.cache/vscode-eslint"
        "$HOME/.cache/vscode-typescript"
        "$HOME/.config/Code/CachedData"
        "$HOME/.config/Code/logs"
        "$HOME/.config/Code/User/workspaceStorage"
        "$HOME/.config/Code/User/globalStorage"
        "$HOME/.local/share/code-server/CachedData"
        "$HOME/.local/share/code-server/logs"
    )
    
    # 清理各个缓存目录
    for cache_dir in "${VSCODE_CACHE_DIRS[@]}"; do
        if [ -d "$cache_dir" ]; then
            log_info "清理缓存目录: $cache_dir"
            rm -rf "$cache_dir"
        fi
    done
    
    # 清理 VSCode 临时文件
    if [ -d "/tmp" ]; then
        find /tmp -name "vscode-*" -type d -exec rm -rf {} + 2>/dev/null || true
        find /tmp -name "Code-*" -type d -exec rm -rf {} + 2>/dev/null || true
        log_info "清理 VSCode 临时文件"
    fi
    
    # 清理 VSCode 扩展主机进程缓存
    if command -v pkill &> /dev/null; then
        pkill -f "extensionHost" 2>/dev/null || true
        log_info "终止 VSCode 扩展主机进程"
    fi
    
    log_success "VSCode 全局缓存清理完成"
    log_warning "建议重启 VSCode 以确保缓存完全清理"
}

# 清理缓存和构建文件
clean_cache() {
    log_info "清理缓存和构建文件..."
    
    # 清理编译输出
    if [ -d "out" ]; then
        rm -rf out
        log_info "清理编译输出目录: out"
    fi
    
    if [ -d "dist" ]; then
        rm -rf dist
        log_info "清理打包输出目录: dist"
    fi
    
    # 清理 node_modules (可选)
    if [ "$1" = "deep" ]; then
        if [ -d "node_modules" ]; then
            rm -rf node_modules
            log_info "清理 node_modules 目录"
        fi
        
        if [ -f "package-lock.json" ]; then
            rm -f package-lock.json
            log_info "清理 package-lock.json"
        fi
    fi
    
    # 清理 .vsix 文件和符号链接
    find . -name "*.vsix" -type f -delete
    find . -name "${EXTENSION_NAME}-latest.vsix" -type l -delete 2>/dev/null || true
    log_info "清理 .vsix 文件和符号链接"
    
    # 清理测试覆盖率报告
    if [ -d "coverage" ]; then
        rm -rf coverage
        log_info "清理测试覆盖率报告"
    fi
    
    # 清理 VSCode 扩展缓存
    if command -v code &> /dev/null; then
        log_info "清理 VSCode 项目扩展缓存..."
        
        # 卸载旧版本的扩展 (使用完整的扩展ID)
        PUBLISHER=$(node -p "require('./package.json').publisher" 2>/dev/null || echo "serial-studio")
        FULL_EXTENSION_ID="${PUBLISHER}.${EXTENSION_NAME}"
        if code --list-extensions | grep -q "${FULL_EXTENSION_ID}"; then
            code --uninstall-extension "${FULL_EXTENSION_ID}"
            log_info "卸载旧版本扩展: ${FULL_EXTENSION_ID}"
        fi
        
        # 清理 VSCode 扩展缓存目录
        if [ -d "$HOME/.vscode/extensions" ]; then
            find "$HOME/.vscode/extensions" -name "*${EXTENSION_NAME}*" -type d -exec rm -rf {} + 2>/dev/null || true
            log_info "清理项目相关扩展缓存目录"
        fi
    fi
    
    # 如果是深度清理，同时清理 VSCode 全局缓存
    if [ "$1" = "deep" ] || [ "$1" = "vscode" ]; then
        clean_vscode_cache
    fi
    
    log_success "清理完成"
}

# 运行测试套件
run_tests() {
    log_info "运行测试套件..."
    
    check_dependencies
    install_dependencies
    
    # 运行单元测试
    log_info "运行单元测试..."
    if npm run test:unit; then
        log_success "单元测试通过"
    else
        log_warning "单元测试失败"
        return 1
    fi
    
    # 运行集成测试
    log_info "运行集成测试..."
    if npm run test:integration; then
        log_success "集成测试通过"
    else
        log_warning "集成测试失败"
        return 1
    fi
    
    log_success "所有测试通过"
}

# 运行性能测试
run_performance_tests() {
    log_info "运行性能测试..."
    
    check_dependencies
    install_dependencies
    
    if npm run test:performance; then
        log_success "性能测试完成"
    else
        log_warning "性能测试失败"
        return 1
    fi
}

# 生成测试覆盖率报告
generate_coverage() {
    log_info "生成测试覆盖率报告..."
    
    check_dependencies
    install_dependencies
    
    if npm run test:coverage:full; then
        log_success "测试覆盖率报告生成完成"
        if [ -d "coverage" ]; then
            log_info "覆盖率报告位置: coverage/index.html"
        fi
    else
        log_warning "测试覆盖率报告生成失败"
        return 1
    fi
}

# 完整构建流程
build_extension() {
    log_info "开始构建 ${DISPLAY_NAME}..."
    
    check_dependencies
    validate_extension_files
    install_dependencies
    
    # 运行代码验证
    run_typecheck
    run_lint
    compile_project
    package_extension
    
    VERSION=$(get_version)
    VERSIONED_NAME="${EXTENSION_NAME}-${VERSION}.vsix"
    
    log_success "构建完成！"
    log_info "生成的文件: ${VERSIONED_NAME}"
    log_info "符号链接: ${EXTENSION_NAME}-latest.vsix"
    log_info "运行 './build.sh install' 来安装扩展"
}

# 快速构建并安装
build_and_install() {
    log_info "快速构建并安装 ${DISPLAY_NAME}..."
    
    build_extension
    install_extension
    
    log_success "构建并安装完成！"
    log_info "请重启 VSCode 以使扩展生效"
}

# 开发模式 - 监听文件变化并自动编译
dev_mode() {
    log_info "启动开发模式 - 监听文件变化..."
    
    check_dependencies
    install_dependencies
    
    log_info "开始监听项目文件变化，自动重新构建..."
    log_info "按 Ctrl+C 停止监听"
    npm run watch
}

# 显示项目信息
show_info() {
    log_info "项目信息:"
    echo "  扩展名称: ${EXTENSION_NAME}"
    echo "  显示名称: ${DISPLAY_NAME}"
    echo "  版本号: $(get_version)"
    echo "  项目目录: $(pwd)"
    
    if [ -f "package.json" ]; then
        PUBLISHER=$(node -p "require('./package.json').publisher" 2>/dev/null || echo "未设置")
        DESCRIPTION=$(node -p "require('./package.json').description" 2>/dev/null || echo "未设置")
        echo "  发布者: ${PUBLISHER}"
        echo "  描述: ${DESCRIPTION}"
    fi
    
    echo ""
    log_info "项目结构:"
    if [ -d "src" ]; then
        echo "  TypeScript 源文件: $(find src -name '*.ts' | wc -l) 个"
        echo "  Vue 组件文件: $(find src -name '*.vue' | wc -l) 个"
    fi
    if [ -d "src/extension" ]; then
        echo "  扩展后端文件: $(find src/extension -name '*.ts' | wc -l) 个"
    fi
    if [ -d "src/webview" ]; then
        echo "  前端视图文件: $(find src/webview -name '*.ts' -o -name '*.vue' | wc -l) 个"
    fi
    if [ -d "src/shared" ]; then
        echo "  共享模块文件: $(find src/shared -name '*.ts' | wc -l) 个"
    fi
    if [ -d "src/workers" ]; then
        echo "  Worker 文件: $(find src/workers -name '*.ts' | wc -l) 个"
    fi
    if [ -d "utest" ]; then
        echo "  单元测试文件: $(find utest -name '*.ts' -o -name '*.js' | wc -l) 个"
    fi
    
    echo ""
    log_info "构建状态:"
    if [ -d "dist" ]; then
        echo "  Webpack 输出: ✓ 存在"
    else
        echo "  Webpack 输出: ✗ 不存在"
    fi
    if [ -d "out" ]; then
        echo "  TypeScript 输出: ✓ 存在"
    else
        echo "  TypeScript 输出: ✗ 不存在"
    fi
    if [ -f "${EXTENSION_NAME}-latest.vsix" ]; then
        echo "  扩展包: ✓ 存在"
    else
        echo "  扩展包: ✗ 不存在"
    fi
}

# 显示帮助信息
show_help() {
    echo "Serial Studio VSCode 插件构建脚本"
    echo ""
    echo "用法: $0 <command>"
    echo ""
    echo "构建命令:"
    echo "  build         - 完整构建扩展"
    echo "  build-install - 构建并安装扩展"
    echo "  compile       - 仅编译 TypeScript"
    echo "  package       - 仅打包扩展"
    echo "  install       - 安装扩展到 VSCode"
    echo ""
    echo "开发命令:"
    echo "  dev           - 开发模式(监听文件变化并自动重新构建)"
    echo "  test          - 运行完整测试套件"
    echo "  test-unit     - 运行单元测试"
    echo "  test-perf     - 运行性能测试"
    echo "  coverage      - 生成测试覆盖率报告"
    echo "  lint          - 运行代码检查"
    echo "  typecheck     - 运行TypeScript类型检查"
    echo ""
    echo "清理命令:"
    echo "  clean         - 清理构建文件和项目缓存"
    echo "  clean-vscode  - 清理 VSCode 全局缓存"
    echo "  deep-clean    - 深度清理(包括 node_modules 和 VSCode 缓存)"
    echo ""
    echo "信息命令:"
    echo "  info          - 显示项目信息"
    echo "  help          - 显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 build         # 构建串口数据可视化扩展"
    echo "  $0 build-install # 构建并安装扩展"
    echo "  $0 dev           # 开发模式"
    echo "  $0 test          # 运行测试"
    echo "  $0 coverage      # 生成覆盖率报告"
    echo ""
    echo "项目特色功能:"
    echo "  - 串口数据实时可视化"
    echo "  - 支持多种数据格式解析"
    echo "  - 图表和仪表盘显示"
    echo "  - 数据导出功能"
    echo "  - MQTT 数据源支持"
}

# 主函数
main() {
    # 如果没有传入参数，显示帮助信息
    if [ $# -eq 0 ]; then
        echo -e "${YELLOW}请指定一个命令参数！${NC}"
        echo ""
        show_help
        exit 1
    fi
    
    case "$1" in
        "build")
            build_extension
            ;;
        "build-install")
            build_and_install
            ;;
        "install")
            install_extension
            ;;
        "clean")
            clean_cache
            ;;
        "clean-vscode")
            clean_vscode_cache
            ;;
        "deep-clean")
            clean_cache deep
            ;;
        "compile")
            check_dependencies
            install_dependencies
            compile_project
            ;;
        "package")
            package_extension
            ;;
        "dev")
            dev_mode
            ;;
        "test")
            run_tests
            ;;
        "test-unit")
            check_dependencies
            install_dependencies
            log_info "运行单元测试..."
            npm run test:unit
            log_success "单元测试完成"
            ;;
        "test-perf")
            run_performance_tests
            ;;
        "coverage")
            generate_coverage
            ;;
        "lint")
            check_dependencies
            install_dependencies
            run_lint
            ;;
        "typecheck")
            check_dependencies
            install_dependencies
            run_typecheck
            ;;
        "info")
            show_info
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            log_error "未知命令: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# 错误处理
trap 'log_error "脚本执行过程中发生错误，退出码: $?"' ERR

# 脚本入口
main "$@"
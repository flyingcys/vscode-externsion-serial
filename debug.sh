#!/bin/bash

# Serial Studio VSCode扩展 - 一键调试环境搭建脚本
# 运行此脚本后，直接按F5即可启动调试

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
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

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 命令未找到，请先安装"
        exit 1
    fi
}

# 检查目录是否存在
check_directory() {
    if [ ! -d "$1" ]; then
        log_error "目录不存在: $1"
        exit 1
    fi
}

# 检查文件是否存在
check_file() {
    if [ ! -f "$1" ]; then
        log_error "文件不存在: $1"
        exit 1
    fi
}

# 主函数
main() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Serial Studio VSCode 扩展调试环境搭建${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo

    # 1. 环境检查
    log_info "检查开发环境..."
    check_command "node"
    check_command "npm"
    check_file "package.json"
    check_directory "src"
    
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    log_success "Node.js: $NODE_VERSION, npm: $NPM_VERSION"

    # 检查 Node.js 版本
    MAJOR_VERSION=$(echo $NODE_VERSION | sed 's/v//' | cut -d. -f1)
    if [ "$MAJOR_VERSION" -lt 18 ]; then
        log_error "Node.js 版本过低 (当前: $NODE_VERSION)，建议使用 Node.js 18+ 版本"
        read -p "$(echo -e ${YELLOW}是否继续？ [y/N]: ${NC})" -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi

    # 2. 检查并安装主项目依赖
    log_info "检查主项目依赖..."
    if [ ! -d "node_modules" ]; then
        log_warning "node_modules不存在，正在安装依赖..."
        npm install
    else
        log_success "主项目依赖已存在"
        
        # 检查依赖是否需要更新
        if [ package-lock.json -nt node_modules ]; then
            log_warning "检测到依赖可能需要更新..."
            read -p "$(echo -e ${YELLOW}是否重新安装依赖？ [y/N]: ${NC})" -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                npm install
            fi
        fi
    fi

    # 3. 检查构建输出目录
    log_info "检查构建输出目录..."
    if [ ! -d "out" ]; then
        log_warning "out目录不存在，将在编译时创建"
    else
        log_success "out构建目录已存在"
    fi
    
    if [ ! -d "dist" ]; then
        log_warning "dist目录不存在，将在webpack打包时创建"
    else
        log_success "dist打包目录已存在"
    fi

    # 4. 创建调试配置文件
    log_info "配置调试环境..."
    
    # 创建.vscode目录
    mkdir -p .vscode

    # 创建tasks.json
    cat > .vscode/tasks.json << 'EOF'
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "编译扩展",
            "type": "npm",
            "script": "compile",
            "group": {
                "kind": "build",
                "isDefault": true
            },
            "presentation": {
                "echo": true,
                "reveal": "silent",
                "focus": false,
                "panel": "shared",
                "showReuseMessage": true,
                "clear": false
            },
            "problemMatcher": "$tsc"
        },
        {
            "label": "监听编译",
            "type": "npm",
            "script": "watch",
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "new",
                "showReuseMessage": true,
                "clear": false
            },
            "problemMatcher": "$tsc-watch",
            "isBackground": true,
            "runOptions": {
                "runOn": "folderOpen"
            }
        },
        {
            "label": "Webpack 生产构建",
            "type": "npm",
            "script": "package",
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared",
                "showReuseMessage": true,
                "clear": false
            },
            "problemMatcher": ["$tsc", "$eslint-stylish"]
        },
        {
            "label": "运行单元测试",
            "type": "npm",
            "script": "test:unit",
            "group": "test",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "new",
                "showReuseMessage": true,
                "clear": false
            },
            "problemMatcher": []
        },
        {
            "label": "生成测试覆盖率",
            "type": "npm",
            "script": "test:coverage:full",
            "group": "test",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "new",
                "showReuseMessage": true,
                "clear": false
            },
            "problemMatcher": []
        },
        {
            "label": "类型检查",
            "type": "npm",
            "script": "type-check",
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared",
                "showReuseMessage": true,
                "clear": false
            },
            "problemMatcher": "$tsc"
        }
    ]
}
EOF

    # 创建launch.json
    cat > .vscode/launch.json << 'EOF'
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "🚀 运行扩展",
            "type": "extensionHost",
            "request": "launch",
            "args": [
                "--extensionDevelopmentPath=${workspaceFolder}",
                "--disable-extensions"
            ],
            "outFiles": [
                "${workspaceFolder}/dist/**/*.js"
            ],
            "preLaunchTask": "编译扩展",
            "skipFiles": [
                "<node_internals>/**"
            ],
            "env": {
                "NODE_ENV": "development",
                "SERIAL_STUDIO_DEBUG": "true"
            },
            "console": "integratedTerminal",
            "internalConsoleOptions": "neverOpen"
        },
        {
            "name": "🔧 完整开发模式",
            "type": "extensionHost",
            "request": "launch",
            "args": [
                "--extensionDevelopmentPath=${workspaceFolder}"
            ],
            "outFiles": [
                "${workspaceFolder}/dist/**/*.js"
            ],
            "preLaunchTask": "编译扩展",
            "skipFiles": [
                "<node_internals>/**"
            ],
            "env": {
                "NODE_ENV": "development",
                "SERIAL_STUDIO_DEBUG": "true",
                "VSCODE_DEBUG_MODE": "true"
            },
            "console": "integratedTerminal",
            "internalConsoleOptions": "neverOpen"
        },
        {
            "name": "🧪 运行扩展测试",
            "type": "extensionHost",
            "request": "launch",
            "args": [
                "--extensionDevelopmentPath=${workspaceFolder}",
                "--extensionTestsPath=${workspaceFolder}/out/test/suite/index"
            ],
            "outFiles": [
                "${workspaceFolder}/out/test/**/*.js"
            ],
            "preLaunchTask": "编译扩展",
            "skipFiles": [
                "<node_internals>/**"
            ],
            "env": {
                "NODE_ENV": "test"
            }
        },
        {
            "name": "🎯 Worker 调试",
            "type": "node",
            "request": "launch",
            "program": "${workspaceFolder}/src/workers/DataProcessor.ts",
            "outFiles": [
                "${workspaceFolder}/out/**/*.js"
            ],
            "env": {
                "NODE_ENV": "development"
            },
            "console": "integratedTerminal",
            "internalConsoleOptions": "neverOpen"
        }
    ]
}
EOF

    # 创建settings.json（调试优化配置）
    cat > .vscode/settings.json << 'EOF'
{
    "typescript.preferences.includePackageJsonAutoImports": "on",
    "typescript.suggest.autoImports": true,
    "typescript.updateImportsOnFileMove.enabled": "always",
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": "explicit",
        "source.organizeImports": "explicit"
    },
    "files.exclude": {
        "out": false,
        "dist": false,
        "coverage": true,
        "**/.git": true,
        "**/.svn": true,
        "**/.hg": true,
        "**/CVS": true,
        "**/.DS_Store": true,
        "**/Thumbs.db": true,
        "**/node_modules": false,
        "**/*.vsix": true
    },
    "search.exclude": {
        "coverage": true,
        "**/node_modules": true,
        "out": true,
        "dist": true,
        "**/*.vsix": true
    },
    "debug.console.fontSize": 14,
    "debug.console.wordWrap": true,
    "debug.console.historySuggestions": true,
    "terminal.integrated.fontSize": 14,
    "editor.formatOnSave": true,
    "editor.formatOnPaste": true,
    "eslint.format.enable": true,
    "eslint.codeActionsOnSave.mode": "all",
    "[typescript]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[vue]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[json]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "vetur.validation.template": false,
    "vetur.validation.script": false,
    "vetur.validation.style": false
}
EOF

    # 创建扩展推荐配置
    cat > .vscode/extensions.json << 'EOF'
{
    "recommendations": [
        "ms-vscode.vscode-typescript-next",
        "esbenp.prettier-vscode",
        "dbaeumer.vscode-eslint",
        "octref.vetur",
        "vue.volar",
        "bradlc.vscode-tailwindcss",
        "ms-vscode.test-adapter-converter",
        "ms-vscode.extension-test-runner"
    ]
}
EOF

    log_success "调试配置文件已创建"

    # 5. 初始编译和构建
    log_info "执行初始编译..."
    if npm run compile; then
        log_success "初始编译完成"
    else
        log_warning "编译存在问题，但将继续设置调试环境"
    fi
    
    # 6. 启动后台监听编译
    log_info "配置TypeScript监听编译..."
    
    # 检查是否已经有watch进程在运行
    if pgrep -f "npm run watch" > /dev/null; then
        log_warning "检测到已有watch进程运行，跳过启动"
    else
        # 询问是否启动watch模式
        read -p "$(echo -e ${YELLOW}是否启动TypeScript监听编译？ [Y/n]: ${NC})" -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            # 使用nohup在后台启动watch
            nohup npm run watch > watch.log 2>&1 &
            WATCH_PID=$!
            echo $WATCH_PID > .watch.pid
            sleep 2
            
            if ps -p $WATCH_PID > /dev/null; then
                log_success "TypeScript监听编译已启动 (PID: $WATCH_PID)"
            else
                log_error "TypeScript监听编译启动失败"
                rm -f .watch.pid
            fi
        fi
    fi

    # 7. 询问是否运行代码检查
    echo
    read -p "$(echo -e ${YELLOW}是否运行 TypeScript 类型检查？ [Y/n]: ${NC})" -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        log_info "运行 TypeScript 类型检查..."
        if npm run type-check; then
            log_success "类型检查通过"
        else
            log_warning "类型检查发现问题，请检查输出"
        fi
    else
        log_info "跳过类型检查"
    fi

    # 8. 询问是否运行ESLint
    echo
    read -p "$(echo -e ${YELLOW}是否运行 ESLint 代码检查？ [y/N]: ${NC})" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "运行 ESLint 代码检查..."
        if npm run lint; then
            log_success "代码检查通过"
        else
            log_warning "代码检查发现问题，请检查输出"
        fi
    else
        log_info "跳过代码检查"
    fi
    
    # 9. 询问是否运行测试
    echo
    read -p "$(echo -e ${YELLOW}是否运行单元测试？ [y/N]: ${NC})" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "运行单元测试..."
        if npm run test:unit; then
            log_success "单元测试通过"
        else
            log_warning "单元测试失败，请检查输出"
        fi
    else
        log_info "跳过单元测试"
    fi

    # 10. 检查项目特定配置
    log_info "验证项目配置..."
    
    # 检查是否排除了utest目录
    if grep -q "utest" tsconfig.json; then
        log_success "已正确排除 utest 测试目录"
    else
        log_warning "建议在 tsconfig.json 中排除 utest 目录"
    fi
    
    # 检查Webpack配置
    if [ -f "webpack.config.js" ]; then
        log_success "找到 Webpack 配置文件"
    else
        log_warning "未找到 Webpack 配置文件"
    fi

    # 11. 完成提示
    echo
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  🎉 调试环境搭建完成！${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo
    echo -e "${BLUE}📋 后续操作:${NC}"
    echo -e "  1. 现在您可以按 ${YELLOW}F5${NC} 启动调试"
    echo -e "  2. 或使用 ${YELLOW}Ctrl+Shift+D${NC} 打开调试面板"
    echo -e "  3. 选择 ${YELLOW}🚀 运行扩展${NC} 配置"
    echo -e "  4. 推荐安装 VSCode 扩展: ${YELLOW}Vue Language Features (Volar)${NC}"
    echo
    echo -e "${BLUE}🎯 调试配置说明:${NC}"
    echo -e "  🚀 运行扩展      - 基础调试模式（推荐日常使用）"
    echo -e "  🔧 完整开发模式  - 包含其他扩展的完整环境"
    echo -e "  🧪 运行扩展测试  - 运行扩展测试套件"
    echo -e "  🎯 Worker 调试   - 调试数据处理Worker"
    echo
    echo -e "${BLUE}📊 监控信息:${NC}"
    if [ -f ".watch.pid" ]; then
        WATCH_PID=$(cat .watch.pid)
        if ps -p $WATCH_PID > /dev/null; then
            echo -e "  📦 TypeScript监听编译: ${GREEN}运行中${NC} (PID: $WATCH_PID)"
        else
            echo -e "  📦 TypeScript监听编译: ${RED}已停止${NC}"
            rm -f .watch.pid
        fi
    else
        echo -e "  📦 TypeScript监听编译: ${YELLOW}未启动${NC}"
    fi
    echo
    echo -e "${BLUE}🔧 常用命令:${NC}"
    echo -e "  停止后台服务: ${YELLOW}./debug.sh stop${NC}"
    echo -e "  查看编译日志: ${YELLOW}tail -f watch.log${NC}"
    echo -e "  运行代码检查: ${YELLOW}npm run lint${NC}"
    echo -e "  运行类型检查: ${YELLOW}npm run type-check${NC}"
    echo -e "  运行测试: ${YELLOW}npm run test:unit${NC}"
    echo -e "  生成覆盖率: ${YELLOW}npm run test:coverage${NC}"
    echo -e "  构建扩展包: ${YELLOW}./build.sh build${NC}"
    echo
    echo -e "${BLUE}🌟 Serial Studio 特性:${NC}"
    echo -e "  - 串口数据实时可视化"
    echo -e "  - 支持多种图表类型"
    echo -e "  - MQTT 数据源支持"
    echo -e "  - 数据导出功能"
    echo -e "  - 高性能数据处理"
    echo
    echo -e "${GREEN}🚀 准备就绪！按F5开始调试吧！${NC}"
}

# 停止所有后台服务
stop_services() {
    log_info "停止调试后台服务..."
    
    # 停止watch进程
    if [ -f ".watch.pid" ]; then
        WATCH_PID=$(cat .watch.pid)
        if ps -p $WATCH_PID > /dev/null; then
            kill $WATCH_PID
            log_success "已停止TypeScript监听编译 (PID: $WATCH_PID)"
        fi
        rm -f .watch.pid
    fi
    
    # 清理其他可能的进程
    pkill -f "npm run watch" 2>/dev/null || true
    
    log_success "所有后台服务已停止"
}

# 重启监听服务
restart_watch() {
    log_info "重启TypeScript监听编译..."
    
    # 先停止现有服务
    stop_services
    
    # 重新启动
    nohup npm run watch > watch.log 2>&1 &
    WATCH_PID=$!
    echo $WATCH_PID > .watch.pid
    sleep 2
    
    if ps -p $WATCH_PID > /dev/null; then
        log_success "TypeScript监听编译已重启 (PID: $WATCH_PID)"
    else
        log_error "TypeScript监听编译重启失败"
        rm -f .watch.pid
        exit 1
    fi
}

# 显示状态信息
show_status() {
    log_info "调试环境状态:"
    
    # 检查配置文件
    if [ -f ".vscode/launch.json" ]; then
        echo -e "  ✓ 调试配置: ${GREEN}已配置${NC}"
    else
        echo -e "  ✗ 调试配置: ${RED}未配置${NC}"
    fi
    
    if [ -f ".vscode/tasks.json" ]; then
        echo -e "  ✓ 任务配置: ${GREEN}已配置${NC}"
    else
        echo -e "  ✗ 任务配置: ${RED}未配置${NC}"
    fi
    
    # 检查构建输出
    if [ -d "out" ]; then
        echo -e "  ✓ TypeScript输出: ${GREEN}存在${NC}"
    else
        echo -e "  ✗ TypeScript输出: ${RED}不存在${NC}"
    fi
    
    if [ -d "dist" ]; then
        echo -e "  ✓ Webpack输出: ${GREEN}存在${NC}"
    else
        echo -e "  ✗ Webpack输出: ${RED}不存在${NC}"
    fi
    
    # 检查后台进程
    if [ -f ".watch.pid" ]; then
        WATCH_PID=$(cat .watch.pid)
        if ps -p $WATCH_PID > /dev/null; then
            echo -e "  ✓ 监听编译: ${GREEN}运行中${NC} (PID: $WATCH_PID)"
        else
            echo -e "  ✗ 监听编译: ${RED}已停止${NC}"
            rm -f .watch.pid
        fi
    else
        echo -e "  ✗ 监听编译: ${YELLOW}未启动${NC}"
    fi
}

# 清理调试配置
clean_debug() {
    log_info "清理调试配置..."
    
    # 停止后台服务
    stop_services
    
    # 删除配置文件
    if [ -d ".vscode" ]; then
        rm -rf .vscode
        log_info "删除 .vscode 配置目录"
    fi
    
    # 删除日志文件
    if [ -f "watch.log" ]; then
        rm -f watch.log
        log_info "删除监听编译日志"
    fi
    
    log_success "调试配置清理完成"
}

# 检查脚本参数
case "${1:-}" in
    "stop")
        stop_services
        exit 0
        ;;
    "restart")
        restart_watch
        exit 0
        ;;
    "status")
        show_status
        exit 0
        ;;
    "clean")
        clean_debug
        exit 0
        ;;
    "help"|"-h"|"--help")
        echo "Serial Studio VSCode扩展调试脚本"
        echo ""
        echo "用法:"
        echo "  $0          # 搭建调试环境"
        echo "  $0 stop     # 停止后台服务"
        echo "  $0 restart  # 重启监听编译"
        echo "  $0 status   # 显示状态信息"
        echo "  $0 clean    # 清理调试配置"
        echo "  $0 help     # 显示帮助"
        echo ""
        echo "调试步骤:"
        echo "  1. 运行 $0 搭建调试环境"
        echo "  2. 在 VSCode 中按 F5 启动调试"
        echo "  3. 选择 '🚀 运行扩展' 配置"
        echo ""
        echo "环境变量:"
        echo "  SERIAL_STUDIO_DEBUG=true  # 启用调试模式"
        echo "  NODE_ENV=development      # 开发环境"
        exit 0
        ;;
    "")
        main
        ;;
    *)
        log_error "未知参数: $1"
        echo "使用 '$0 help' 查看帮助"
        exit 1
        ;;
esac
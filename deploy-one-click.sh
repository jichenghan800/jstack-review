#!/bin/bash

# JStack Review - 一键部署脚本
# 完全自动化安装和配置，无需手动操作

set -e

PROJECT_NAME="jstack-review"
REPO_URL="https://github.com/jichenghan800/jstack-review.git"
INSTALL_DIR="/opt/$PROJECT_NAME"

echo "🚀 JStack Review - AI增强线程分析器 一键部署"
echo "=================================================="
echo "📍 部署目录: $INSTALL_DIR"
echo "📡 项目地址: $REPO_URL"
echo ""

# 颜色输出函数
print_status() {
    echo "📍 $1"
}

print_success() {
    echo "✅ $1"
}

print_error() {
    echo "❌ $1"
    exit 1
}

print_warning() {
    echo "⚠️  $1"
}

# 检查操作系统
check_os() {
    print_status "检查操作系统兼容性..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        print_success "操作系统: Linux"
        OS_TYPE="linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        print_success "操作系统: macOS"
        OS_TYPE="mac"
    else
        print_error "不支持的操作系统: $OSTYPE"
    fi
}

# 检查权限
check_permissions() {
    print_status "检查系统权限..."
    
    # 检查sudo权限
    if sudo -n true 2>/dev/null; then
        print_success "管理员权限验证通过"
    else
        print_warning "需要管理员权限安装系统依赖"
        echo "请输入管理员密码："
        sudo -v || print_error "需要管理员权限才能继续安装"
    fi
    
    # 检查安装目录权限
    if [ -w "$(dirname "$INSTALL_DIR")" ] || sudo -n true 2>/dev/null; then
        print_success "安装目录权限验证通过"
    else
        print_error "无法创建安装目录 $INSTALL_DIR"
    fi
}

# 安装系统依赖
install_system_dependencies() {
    print_status "安装系统依赖..."
    
    if [[ "$OS_TYPE" == "linux" ]]; then
        # 检测Linux发行版
        if command -v apt-get >/dev/null 2>&1; then
            print_status "检测到Ubuntu/Debian系统，使用apt安装..."
            sudo apt-get update -qq
            sudo apt-get install -y curl wget git lsof netcat-openbsd python3 
        elif command -v yum >/dev/null 2>&1; then
            print_status "检测到CentOS/RHEL系统，使用yum安装..."
            sudo yum update -y -q
            sudo yum install -y curl wget git lsof nc python3
        elif command -v dnf >/dev/null 2>&1; then
            print_status "检测到Fedora系统，使用dnf安装..."
            sudo dnf update -y -q
            sudo dnf install -y curl wget git lsof nc python3
        else
            print_error "不支持的Linux发行版"
        fi
    elif [[ "$OS_TYPE" == "mac" ]]; then
        print_status "检测到macOS系统..."
        if ! command -v brew >/dev/null 2>&1; then
            print_status "安装Homebrew..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        fi
        brew install curl wget git python3
    fi
    
    print_success "系统依赖安装完成"
}

# 安装Node.js
install_nodejs() {
    print_status "安装Node.js 18..."
    
    if command -v node >/dev/null 2>&1; then
        NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge 16 ]; then
            print_success "Node.js已安装: $(node --version)"
            return 0
        else
            print_warning "Node.js版本过低，需要升级"
        fi
    fi
    
    if [[ "$OS_TYPE" == "linux" ]]; then
        print_status "安装Node.js 18 (Linux)..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        if command -v apt-get >/dev/null 2>&1; then
            sudo apt-get install -y nodejs
        elif command -v yum >/dev/null 2>&1; then
            sudo yum install -y nodejs
        elif command -v dnf >/dev/null 2>&1; then
            sudo dnf install -y nodejs
        fi
    elif [[ "$OS_TYPE" == "mac" ]]; then
        print_status "安装Node.js 18 (macOS)..."
        brew install node@18
        brew link node@18 --force
    fi
    
    if command -v node >/dev/null 2>&1; then
        print_success "Node.js安装成功: $(node --version)"
    else
        print_error "Node.js安装失败"
    fi
}

# 安装Docker
install_docker() {
    print_status "安装Docker..."
    
    if command -v docker >/dev/null 2>&1; then
        if docker --version >/dev/null 2>&1; then
            print_success "Docker已安装: $(docker --version)"
            return 0
        fi
    fi
    
    if [[ "$OS_TYPE" == "linux" ]]; then
        print_status "安装Docker (Linux)..."
        curl -fsSL https://get.docker.com | sh
        sudo usermod -aG docker $USER
        sudo systemctl start docker
        sudo systemctl enable docker
        print_warning "Docker已安装，可能需要重新登录以使用非root用户"
    elif [[ "$OS_TYPE" == "mac" ]]; then
        print_status "安装Docker (macOS)..."
        brew install --cask docker
        print_warning "请手动启动Docker Desktop应用"
    fi
    
    if command -v docker >/dev/null 2>&1; then
        print_success "Docker安装成功: $(docker --version)"
    else
        print_error "Docker安装失败"
    fi
}

# 克隆项目
clone_project() {
    print_status "克隆项目代码..."
    
    # 清理旧安装
    if [ -d "$INSTALL_DIR" ]; then
        print_warning "发现已存在的安装，正在备份..."
        sudo mv "$INSTALL_DIR" "${INSTALL_DIR}.backup.$(date +%s)" 2>/dev/null || rm -rf "$INSTALL_DIR"
    fi
    
    # 创建安装目录
    sudo mkdir -p "$INSTALL_DIR"
    sudo chown $USER:$USER "$INSTALL_DIR" 2>/dev/null || sudo chown $USER "$INSTALL_DIR"
    
    # 克隆代码
    git clone "$REPO_URL" "$INSTALL_DIR"
    cd "$INSTALL_DIR"
    
    print_success "项目克隆完成"
}

# 安装项目依赖
install_project_dependencies() {
    print_status "安装项目依赖..."
    
    cd "$INSTALL_DIR"
    
    # 安装NPM依赖
    npm install
    
    # 创建必要目录
    mkdir -p logs config
    
    # 创建配置文件
    if [ ! -f "config.json" ] && [ -f "config.example.json" ]; then
        cp config.example.json config.json
        print_success "配置文件已创建"
    fi
    
    print_success "项目依赖安装完成"
}

# 部署服务
deploy_service() {
    print_status "部署服务..."
    
    cd "$INSTALL_DIR"
    
    # 使用最新的增强版部署脚本
    chmod +x *.sh
    
    # 选择最佳的部署方式
    if ./docker-proxy-deploy-robust.sh; then
        print_success "服务部署成功（增强版）"
    elif ./fix-network-deployment.sh; then
        print_success "服务部署成功（网络修复版）"
    elif ./docker-proxy-deploy.sh; then
        print_success "服务部署成功（标准版）"
    else
        print_error "所有部署方案都失败了"
    fi
}

# 验证部署
verify_deployment() {
    print_status "验证部署结果..."
    
    cd "$INSTALL_DIR"
    
    local retries=5
    local count=0
    
    while [ $count -lt $retries ]; do
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 | grep -q "200"; then
            print_success "Web服务验证通过"
            break
        else
            count=$((count + 1))
            if [ $count -lt $retries ]; then
                print_warning "等待服务启动... ($count/$retries)"
                sleep 5
            else
                print_error "服务验证失败"
            fi
        fi
    done
    
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health | grep -q "200"; then
        print_success "API服务验证通过"
    else
        print_warning "API服务可能需要配置AWS凭证"
    fi
}

# 显示结果
show_results() {
    print_success "🎉 JStack Review 一键部署完成！"
    echo ""
    echo "=================================="
    echo "📍 安装位置: $INSTALL_DIR"
    echo "🌐 Web界面: http://localhost:8080"
    echo "📱 AI分析器: http://localhost:8080/ai-simple.html"  
    echo "🔧 传统分析器: http://localhost:8080/jstack-review-original/index.html"
    echo ""
    echo "🔑 AWS配置: 在AI分析器中点击右上角'AI配置'按钮"
    echo "📋 演示功能: 在AI分析器中点击'Demo'按钮体验"
    echo ""
    echo "🛠️  管理命令:"
    echo "   停止服务: cd $INSTALL_DIR && ./stop-all-services.sh"
    echo "   重启服务: cd $INSTALL_DIR && ./docker-proxy-deploy-robust.sh"
    echo "   查看日志: cd $INSTALL_DIR && tail -f logs/*.log"
    echo "   诊断问题: cd $INSTALL_DIR && ./diagnose-deployment.sh"
    echo ""
    echo "📚 文档: https://github.com/jichenghan800/jstack-review"
    echo "=================================="
}

# 主执行流程
main() {
    echo "开始一键部署流程..."
    
    check_os
    check_permissions
    install_system_dependencies
    install_nodejs
    install_docker
    clone_project
    install_project_dependencies
    deploy_service
    verify_deployment
    show_results
    
    print_success "一键部署流程完成！"
}

# 错误处理
trap 'print_error "部署过程中发生错误，请检查上面的错误信息"' ERR

# 执行主流程
main "$@"
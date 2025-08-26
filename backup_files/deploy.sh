#!/bin/bash

# Java Thread Dump Analyzer - AI Enhanced
# 一键部署脚本 for Ubuntu
# Author: jichenghan800
# Version: 2.0

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 项目信息
PROJECT_NAME="jstack-review"
GITHUB_REPO="https://github.com/jichenghan800/jstack-review.git"
INSTALL_DIR="$HOME/jstack-review"
PORT=8080
BEDROCK_PORT=3002

# 打印带颜色的消息
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# 检查是否为root用户
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_error "请不要使用root用户运行此脚本！"
        exit 1
    fi
}

# 检查Ubuntu版本
check_ubuntu() {
    if ! grep -q "Ubuntu" /etc/os-release; then
        print_warning "此脚本专为Ubuntu设计，其他系统可能需要调整"
    fi
    
    local version=$(lsb_release -rs 2>/dev/null || echo "unknown")
    print_message "检测到系统版本: Ubuntu $version"
}

# 更新系统包
update_system() {
    print_step "更新系统包..."
    sudo apt update
    sudo apt upgrade -y
}

# 安装必要的系统依赖
install_system_deps() {
    print_step "安装系统依赖..."
    
    # 基础工具
    sudo apt install -y \
        curl \
        wget \
        git \
        unzip \
        software-properties-common \
        apt-transport-https \
        ca-certificates \
        gnupg \
        lsb-release \
        build-essential
    
    print_success "系统依赖安装完成"
}

# 安装Node.js
install_nodejs() {
    print_step "安装Node.js..."
    
    if command -v node &> /dev/null; then
        local node_version=$(node --version)
        print_message "Node.js已安装: $node_version"
        
        # 检查版本是否足够新 (需要 >= 16)
        local major_version=$(echo $node_version | cut -d'.' -f1 | sed 's/v//')
        if [ "$major_version" -lt 16 ]; then
            print_warning "Node.js版本过低，正在升级..."
        else
            print_success "Node.js版本满足要求"
            return
        fi
    fi
    
    # 安装NodeSource仓库
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    # 验证安装
    node --version
    npm --version
    
    print_success "Node.js安装完成"
}

# 安装Python3
install_python() {
    print_step "安装Python3..."
    
    if command -v python3 &> /dev/null; then
        local python_version=$(python3 --version)
        print_message "Python3已安装: $python_version"
    else
        sudo apt install -y python3 python3-pip
        print_success "Python3安装完成"
    fi
}

# 安装AWS CLI (可选)
install_aws_cli() {
    print_step "安装AWS CLI (用于Bedrock测试)..."
    
    if command -v aws &> /dev/null; then
        local aws_version=$(aws --version)
        print_message "AWS CLI已安装: $aws_version"
        return
    fi
    
    # 下载并安装AWS CLI v2
    cd /tmp
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip -q awscliv2.zip
    sudo ./aws/install
    
    # 验证安装
    aws --version
    
    print_success "AWS CLI安装完成"
}

# 克隆项目
clone_project() {
    print_step "克隆项目..."
    
    # 如果目录已存在，询问是否覆盖
    if [ -d "$INSTALL_DIR" ]; then
        print_warning "目录 $INSTALL_DIR 已存在"
        read -p "是否删除并重新克隆? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -rf "$INSTALL_DIR"
        else
            print_message "使用现有目录，正在更新..."
            cd "$INSTALL_DIR"
            git pull origin gh-pages
            return
        fi
    fi
    
    # 克隆项目
    git clone -b gh-pages "$GITHUB_REPO" "$INSTALL_DIR"
    cd "$INSTALL_DIR"
    
    print_success "项目克隆完成"
}

# 安装项目依赖
install_project_deps() {
    print_step "安装项目依赖..."
    
    cd "$INSTALL_DIR"
    
    # 安装npm依赖
    if [ -f "package.json" ]; then
        npm install
        print_success "npm依赖安装完成"
    fi
    
    # 安装Python依赖 (如果有)
    if [ -f "requirements.txt" ]; then
        pip3 install -r requirements.txt
        print_success "Python依赖安装完成"
    fi
}

# 创建启动脚本
create_start_scripts() {
    print_step "创建启动脚本..."
    
    cd "$INSTALL_DIR"
    
    # 创建主服务启动脚本
    cat > start-server.sh << 'EOF'
#!/bin/bash

# Java Thread Dump Analyzer 启动脚本

PORT=${1:-8080}
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 启动 Java Thread Dump Analyzer..."
echo "📁 项目目录: $PROJECT_DIR"
echo "🌐 访问地址: http://localhost:$PORT"
echo ""
echo "可用页面:"
echo "  - 主页: http://localhost:$PORT/"
echo "  - AI分析器: http://localhost:$PORT/ai-simple.html"
echo "  - 传统分析器: http://localhost:$PORT/test.html"
echo ""
echo "按 Ctrl+C 停止服务"
echo ""

cd "$PROJECT_DIR"

# 检查Python版本并启动HTTP服务器
if command -v python3 &> /dev/null; then
    python3 -m http.server $PORT
elif command -v python &> /dev/null; then
    python -m http.server $PORT
else
    echo "❌ 未找到Python，无法启动HTTP服务器"
    exit 1
fi
EOF

    # 创建Bedrock测试服务启动脚本
    cat > start-bedrock-service.sh << 'EOF'
#!/bin/bash

# AWS Bedrock 测试服务启动脚本

PORT=${1:-3002}
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔧 启动 AWS Bedrock 测试服务..."
echo "📁 项目目录: $PROJECT_DIR"
echo "🌐 服务地址: http://localhost:$PORT"
echo ""
echo "按 Ctrl+C 停止服务"
echo ""

cd "$PROJECT_DIR"

if [ -f "bedrock-test-server.js" ]; then
    node bedrock-test-server.js
else
    echo "❌ 未找到 bedrock-test-server.js"
    exit 1
fi
EOF

    # 创建完整启动脚本 (同时启动两个服务)
    cat > start-all.sh << 'EOF'
#!/bin/bash

# 完整服务启动脚本

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_PORT=${1:-8080}
BEDROCK_PORT=${2:-3002}

echo "🚀 启动完整的 Java Thread Dump Analyzer 服务..."
echo ""

# 启动Bedrock测试服务 (后台)
if [ -f "$PROJECT_DIR/bedrock-test-server.js" ]; then
    echo "🔧 启动 Bedrock 测试服务 (端口: $BEDROCK_PORT)..."
    cd "$PROJECT_DIR"
    nohup node bedrock-test-server.js > bedrock-service.log 2>&1 &
    BEDROCK_PID=$!
    echo "✅ Bedrock 服务已启动 (PID: $BEDROCK_PID)"
    sleep 2
fi

# 启动Web服务
echo "🌐 启动 Web 服务 (端口: $WEB_PORT)..."
echo ""
echo "访问地址:"
echo "  - 主页: http://localhost:$WEB_PORT/"
echo "  - AI分析器: http://localhost:$WEB_PORT/ai-simple.html"
echo "  - 传统分析器: http://localhost:$WEB_PORT/test.html"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo ""

# 设置信号处理，确保退出时清理后台进程
cleanup() {
    echo ""
    echo "🛑 正在停止服务..."
    if [ ! -z "$BEDROCK_PID" ]; then
        kill $BEDROCK_PID 2>/dev/null || true
        echo "✅ Bedrock 服务已停止"
    fi
    exit 0
}

trap cleanup SIGINT SIGTERM

# 启动Web服务
cd "$PROJECT_DIR"
if command -v python3 &> /dev/null; then
    python3 -m http.server $WEB_PORT
elif command -v python &> /dev/null; then
    python -m http.server $WEB_PORT
else
    echo "❌ 未找到Python，无法启动HTTP服务器"
    cleanup
fi
EOF

    # 设置执行权限
    chmod +x start-server.sh
    chmod +x start-bedrock-service.sh
    chmod +x start-all.sh
    
    print_success "启动脚本创建完成"
}

# 创建系统服务 (可选)
create_systemd_service() {
    print_step "创建系统服务 (可选)..."
    
    read -p "是否创建systemd服务以便开机自启? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        return
    fi
    
    # 创建服务文件
    sudo tee /etc/systemd/system/jstack-analyzer.service > /dev/null << EOF
[Unit]
Description=Java Thread Dump Analyzer - AI Enhanced
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$INSTALL_DIR
ExecStart=/usr/bin/python3 -m http.server $PORT
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    # 重载systemd并启用服务
    sudo systemctl daemon-reload
    sudo systemctl enable jstack-analyzer.service
    
    print_success "系统服务创建完成"
    print_message "使用以下命令管理服务:"
    echo "  启动: sudo systemctl start jstack-analyzer"
    echo "  停止: sudo systemctl stop jstack-analyzer"
    echo "  状态: sudo systemctl status jstack-analyzer"
}

# 配置防火墙
configure_firewall() {
    print_step "配置防火墙..."
    
    if command -v ufw &> /dev/null; then
        read -p "是否配置UFW防火墙规则? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sudo ufw allow $PORT/tcp comment "Java Thread Dump Analyzer"
            sudo ufw allow $BEDROCK_PORT/tcp comment "Bedrock Test Service"
            print_success "防火墙规则已配置"
        fi
    fi
}

# 显示部署完成信息
show_completion_info() {
    echo ""
    echo "🎉🎉🎉 部署完成！🎉🎉🎉"
    echo ""
    echo -e "${GREEN}项目信息:${NC}"
    echo "  📁 安装目录: $INSTALL_DIR"
    echo "  🌐 Web端口: $PORT"
    echo "  🔧 Bedrock端口: $BEDROCK_PORT"
    echo ""
    echo -e "${BLUE}启动方式:${NC}"
    echo "  1. 仅Web服务:     cd $INSTALL_DIR && ./start-server.sh"
    echo "  2. 仅Bedrock服务: cd $INSTALL_DIR && ./start-bedrock-service.sh"
    echo "  3. 完整服务:      cd $INSTALL_DIR && ./start-all.sh"
    echo ""
    echo -e "${CYAN}访问地址:${NC}"
    echo "  🏠 主页:        http://localhost:$PORT/"
    echo "  🤖 AI分析器:    http://localhost:$PORT/ai-simple.html"
    echo "  🔧 传统分析器:  http://localhost:$PORT/test.html"
    echo ""
    echo -e "${YELLOW}配置说明:${NC}"
    echo "  • OpenAI: 需要配置API Key (https://platform.openai.com)"
    echo "  • Bedrock: 需要配置AWS凭证 (Access Key + Secret Key)"
    echo "  • 所有配置都保存在浏览器本地，安全可靠"
    echo ""
    echo -e "${PURPLE}快速启动:${NC}"
    echo "  cd $INSTALL_DIR && ./start-all.sh"
    echo ""
}

# 主函数
main() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║          Java Thread Dump Analyzer - AI Enhanced            ║"
    echo "║                     一键部署脚本                             ║"
    echo "║                                                              ║"
    echo "║  🤖 支持 OpenAI GPT & AWS Bedrock                           ║"
    echo "║  📊 智能健康评分 & 问题检测                                  ║"
    echo "║  🔧 专业线程分析 & 性能优化                                  ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    
    print_message "开始部署 Java Thread Dump Analyzer..."
    echo ""
    
    # 执行部署步骤
    check_root
    check_ubuntu
    update_system
    install_system_deps
    install_nodejs
    install_python
    install_aws_cli
    clone_project
    install_project_deps
    create_start_scripts
    create_systemd_service
    configure_firewall
    show_completion_info
    
    print_success "🎊 部署完成！享受AI增强的线程分析体验吧！"
}

# 错误处理
trap 'print_error "部署过程中发生错误，请检查上面的错误信息"; exit 1' ERR

# 运行主函数
main "$@"

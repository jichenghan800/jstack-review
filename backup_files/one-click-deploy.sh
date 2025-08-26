#!/bin/bash

# Java Thread Dump Analyzer - AI Enhanced
# 真正的一键部署脚本 - 完全自动化，无需任何交互
# 使用方法: curl -fsSL https://raw.githubusercontent.com/jichenghan800/jstack-review/gh-pages/one-click-deploy.sh | bash

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 项目配置
if [[ $EUID -eq 0 ]]; then
    INSTALL_DIR="/opt/jstack-review"
    USER_HOME="/root"
else
    INSTALL_DIR="$HOME/jstack-review"
    USER_HOME="$HOME"
fi

PORT=8080
BEDROCK_PORT=3002

echo -e "${CYAN}🚀 Java Thread Dump Analyzer - 一键自动部署${NC}"
echo "=================================================="
echo -e "${YELLOW}安装目录: $INSTALL_DIR${NC}"
echo ""

# 改进的执行函数，包含错误详情
run_step() {
    local desc="$1"
    local cmd="$2"
    echo -n "$desc... "
    
    # 创建临时文件存储错误输出
    local error_file=$(mktemp)
    
    if eval "$cmd" > "$error_file" 2>&1; then
        echo -e "${GREEN}✓${NC}"
        rm -f "$error_file"
        return 0
    else
        echo -e "${RED}❌${NC}"
        echo -e "${RED}错误详情:${NC}"
        cat "$error_file"
        rm -f "$error_file"
        echo ""
        echo -e "${YELLOW}尝试手动执行: $cmd${NC}"
        return 1
    fi
}

# 检测系统类型
detect_system() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    else
        OS=$(uname -s)
        VER=$(uname -r)
    fi
    echo -e "${BLUE}检测到系统: $OS $VER${NC}"
}

# 安装依赖的函数
install_dependencies() {
    echo -e "\n${BLUE}开始安装依赖...${NC}"
    
    # 1. 更新包列表
    if ! run_step "更新系统包列表" "apt update"; then
        echo -e "${YELLOW}尝试修复包管理器...${NC}"
        run_step "修复dpkg" "dpkg --configure -a"
        run_step "修复apt" "apt --fix-broken install -y"
        run_step "再次更新包列表" "apt update"
    fi
    
    # 2. 安装基础工具
    run_step "安装基础工具" "DEBIAN_FRONTEND=noninteractive apt install -y curl wget git unzip"
    
    # 3. 安装Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${BLUE}安装Node.js...${NC}"
        if ! run_step "添加NodeJS仓库" "curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -"; then
            # 备用方案：直接安装系统版本
            run_step "安装系统Node.js" "DEBIAN_FRONTEND=noninteractive apt install -y nodejs npm"
        else
            run_step "安装最新Node.js" "DEBIAN_FRONTEND=noninteractive apt install -y nodejs"
        fi
    else
        echo -e "Node.js已安装 ${GREEN}✓${NC}"
    fi
    
    # 4. 安装Python3
    run_step "安装Python3" "DEBIAN_FRONTEND=noninteractive apt install -y python3 python3-pip"
    
    # 5. 安装AWS CLI (可选)
    if ! command -v aws &> /dev/null; then
        echo -e "${BLUE}安装AWS CLI...${NC}"
        if ! run_step "下载AWS CLI" "cd /tmp && curl -s 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip' -o 'awscliv2.zip'"; then
            echo -e "${YELLOW}跳过AWS CLI安装${NC}"
        else
            run_step "安装AWS CLI" "cd /tmp && unzip -q awscliv2.zip && ./aws/install"
        fi
    else
        echo -e "AWS CLI已安装 ${GREEN}✓${NC}"
    fi
}

# 部署项目
deploy_project() {
    echo -e "\n${BLUE}部署项目...${NC}"
    
    # 克隆或更新项目
    if [ -d "$INSTALL_DIR" ]; then
        run_step "更新项目代码" "cd '$INSTALL_DIR' && git pull origin gh-pages"
    else
        run_step "克隆项目代码" "git clone -b gh-pages https://github.com/jichenghan800/jstack-review.git '$INSTALL_DIR'"
    fi
    
    # 安装项目依赖
    cd "$INSTALL_DIR"
    run_step "安装项目依赖" "npm install"
    
    # 设置权限
    run_step "设置脚本权限" "chmod +x *.sh"
}

# 启动服务
start_services() {
    echo -e "\n${BLUE}启动服务...${NC}"
    
    cd "$INSTALL_DIR"
    
    # 检查端口是否被占用
    if netstat -tlnp 2>/dev/null | grep -q ":$PORT "; then
        echo -e "${YELLOW}端口 $PORT 已被占用，尝试停止现有服务...${NC}"
        pkill -f "http.server $PORT" 2>/dev/null || true
        sleep 2
    fi
    
    if netstat -tlnp 2>/dev/null | grep -q ":$BEDROCK_PORT "; then
        echo -e "${YELLOW}端口 $BEDROCK_PORT 已被占用，尝试停止现有服务...${NC}"
        pkill -f "bedrock-test-server" 2>/dev/null || true
        sleep 2
    fi
    
    # 启动Bedrock服务
    if [ -f "bedrock-test-server.js" ]; then
        nohup node bedrock-test-server.js > bedrock.log 2>&1 &
        BEDROCK_PID=$!
        echo -e "Bedrock服务已启动 (PID: $BEDROCK_PID) ${GREEN}✓${NC}"
    fi
    
    # 启动Web服务
    nohup python3 -m http.server $PORT > web.log 2>&1 &
    WEB_PID=$!
    echo -e "Web服务已启动 (PID: $WEB_PID) ${GREEN}✓${NC}"
    
    # 等待服务启动
    sleep 3
    
    # 验证服务
    if curl -s --connect-timeout 5 "http://localhost:$PORT" > /dev/null 2>&1; then
        echo -e "Web服务运行正常 ${GREEN}✓${NC}"
    else
        echo -e "${YELLOW}Web服务可能需要更多时间启动${NC}"
    fi
    
    if curl -s --connect-timeout 5 "http://localhost:$BEDROCK_PORT/health" > /dev/null 2>&1; then
        echo -e "Bedrock服务运行正常 ${GREEN}✓${NC}"
    else
        echo -e "${YELLOW}Bedrock服务可能需要更多时间启动${NC}"
    fi
}

# 配置防火墙
configure_firewall() {
    if command -v ufw &> /dev/null; then
        echo -e "\n${BLUE}配置防火墙...${NC}"
        run_step "启用防火墙" "ufw --force enable" || true
        run_step "开放Web端口" "ufw allow $PORT/tcp" || true
        run_step "开放Bedrock端口" "ufw allow $BEDROCK_PORT/tcp" || true
    fi
}

# 显示完成信息
show_completion() {
    local server_ip=$(curl -s --connect-timeout 5 ifconfig.me 2>/dev/null || echo "YOUR_SERVER_IP")
    
    echo ""
    echo "🎉🎉🎉 部署完成！🎉🎉🎉"
    echo ""
    echo -e "${GREEN}✅ 所有服务已启动并运行${NC}"
    echo ""
    echo -e "${CYAN}📱 访问地址:${NC}"
    echo "  🏠 主页:        http://localhost:$PORT/"
    echo "  🤖 AI分析器:    http://localhost:$PORT/ai-simple.html"
    echo "  🔧 传统分析器:  http://localhost:$PORT/test.html"
    echo ""
    
    if [ "$server_ip" != "YOUR_SERVER_IP" ]; then
        echo -e "${YELLOW}🌐 外网访问地址:${NC}"
        echo "  🤖 AI分析器:    http://$server_ip:$PORT/ai-simple.html"
        echo "  🔧 传统分析器:  http://$server_ip:$PORT/test.html"
        echo ""
    fi
    
    echo -e "${BLUE}📋 服务信息:${NC}"
    echo "  📁 安装目录: $INSTALL_DIR"
    echo "  🌐 Web端口: $PORT"
    echo "  🔧 Bedrock端口: $BEDROCK_PORT"
    echo "  📄 Web日志: $INSTALL_DIR/web.log"
    echo "  📄 Bedrock日志: $INSTALL_DIR/bedrock.log"
    echo ""
    echo -e "${YELLOW}🔑 配置AI服务:${NC}"
    echo "  • OpenAI: 需要API Key (https://platform.openai.com)"
    echo "  • AWS Bedrock: 需要AWS凭证 (Access Key + Secret Key)"
    echo ""
    echo -e "${GREEN}🎊 开始使用AI增强的线程分析吧！${NC}"
}

# 主函数
main() {
    detect_system
    install_dependencies
    deploy_project
    configure_firewall
    start_services
    show_completion
}

# 错误处理
handle_error() {
    echo ""
    echo -e "${RED}❌ 部署过程中发生错误！${NC}"
    echo -e "${YELLOW}💡 常见解决方案:${NC}"
    echo "1. 检查网络连接"
    echo "2. 确保有足够的磁盘空间"
    echo "3. 检查系统权限"
    echo "4. 手动执行失败的命令"
    echo ""
    echo -e "${BLUE}📞 获取帮助:${NC}"
    echo "GitHub Issues: https://github.com/jichenghan800/jstack-review/issues"
    exit 1
}

trap handle_error ERR

# 运行主函数
main "$@"

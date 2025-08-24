#!/bin/bash

# Java Thread Dump Analyzer - 重新部署脚本
# 完全清理现有安装，然后重新部署
# curl -fsSL https://raw.githubusercontent.com/jichenghan800/jstack-review/gh-pages/redeploy.sh | bash

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

echo -e "${CYAN}🔄 Java Thread Dump Analyzer - 重新部署${NC}"
echo "=================================================="
echo -e "${YELLOW}⚠️  这将完全清理现有安装并重新部署${NC}"
echo -e "${YELLOW}📁 安装目录: $INSTALL_DIR${NC}"
echo ""

# 执行函数
run_step() {
    local desc="$1"
    local cmd="$2"
    echo -n "$desc... "
    
    if eval "$cmd" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
        return 0
    else
        echo -e "${RED}❌${NC}"
        return 1
    fi
}

# 1. 完全清理现有安装
cleanup_existing() {
    echo -e "\n${BLUE}🧹 清理现有安装...${NC}"
    
    # 停止所有相关进程
    echo -n "停止Web服务... "
    pkill -f "http.server $PORT" > /dev/null 2>&1 || true
    pkill -f "python.*http.server.*$PORT" > /dev/null 2>&1 || true
    echo -e "${GREEN}✓${NC}"
    
    echo -n "停止Bedrock服务... "
    pkill -f "bedrock-test-server" > /dev/null 2>&1 || true
    pkill -f "node.*bedrock" > /dev/null 2>&1 || true
    echo -e "${GREEN}✓${NC}"
    
    # 等待进程完全停止
    sleep 2
    
    # 删除systemd服务
    if [ -f "/etc/systemd/system/jstack-analyzer.service" ]; then
        echo -n "删除系统服务... "
        systemctl stop jstack-analyzer > /dev/null 2>&1 || true
        systemctl disable jstack-analyzer > /dev/null 2>&1 || true
        rm -f /etc/systemd/system/jstack-analyzer.service > /dev/null 2>&1 || true
        systemctl daemon-reload > /dev/null 2>&1 || true
        echo -e "${GREEN}✓${NC}"
    fi
    
    # 删除安装目录
    if [ -d "$INSTALL_DIR" ]; then
        echo -n "删除安装目录... "
        rm -rf "$INSTALL_DIR" > /dev/null 2>&1 || true
        echo -e "${GREEN}✓${NC}"
    fi
    
    # 清理可能的备份目录
    for backup_dir in "$INSTALL_DIR.backup" "$INSTALL_DIR.old" "$USER_HOME/jstack-review.backup"; do
        if [ -d "$backup_dir" ]; then
            echo -n "清理备份目录 $(basename $backup_dir)... "
            rm -rf "$backup_dir" > /dev/null 2>&1 || true
            echo -e "${GREEN}✓${NC}"
        fi
    done
    
    # 清理npm缓存
    if command -v npm &> /dev/null; then
        echo -n "清理npm缓存... "
        npm cache clean --force > /dev/null 2>&1 || true
        echo -e "${GREEN}✓${NC}"
    fi
    
    # 清理临时文件
    echo -n "清理临时文件... "
    rm -rf /tmp/jstack-* > /dev/null 2>&1 || true
    rm -rf /tmp/awscliv2.zip > /dev/null 2>&1 || true
    rm -rf /tmp/aws > /dev/null 2>&1 || true
    echo -e "${GREEN}✓${NC}"
    
    echo -e "${GREEN}✅ 清理完成！${NC}"
}

# 2. 检查并安装依赖
install_dependencies() {
    echo -e "\n${BLUE}📦 检查并安装依赖...${NC}"
    
    # 更新包列表
    run_step "更新系统包列表" "apt update"
    
    # 检查并安装基础工具
    local missing_packages=()
    
    for package in curl wget git unzip nodejs npm python3; do
        if ! command -v $package &> /dev/null && ! dpkg -l | grep -q "^ii.*$package "; then
            missing_packages+=($package)
        fi
    done
    
    if [ ${#missing_packages[@]} -gt 0 ]; then
        echo -e "${YELLOW}需要安装: ${missing_packages[*]}${NC}"
        run_step "安装缺失的包" "DEBIAN_FRONTEND=noninteractive apt install -y ${missing_packages[*]}"
    else
        echo -e "所有基础依赖已安装 ${GREEN}✓${NC}"
    fi
    
    # 检查Node.js版本
    if command -v node &> /dev/null; then
        local node_version=$(node --version | cut -d'.' -f1 | sed 's/v//')
        if [ "$node_version" -lt 14 ]; then
            echo -e "${YELLOW}Node.js版本过低，升级中...${NC}"
            run_step "添加NodeJS仓库" "curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -"
            run_step "升级Node.js" "DEBIAN_FRONTEND=noninteractive apt install -y nodejs"
        fi
    fi
    
    # 安装AWS CLI (可选)
    if ! command -v aws &> /dev/null; then
        echo -e "${BLUE}安装AWS CLI...${NC}"
        if run_step "下载AWS CLI" "cd /tmp && curl -s 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip' -o 'awscliv2.zip'"; then
            run_step "安装AWS CLI" "cd /tmp && unzip -q awscliv2.zip && ./aws/install"
        else
            echo -e "${YELLOW}跳过AWS CLI安装${NC}"
        fi
    fi
}

# 3. 全新部署项目
deploy_fresh() {
    echo -e "\n${BLUE}🚀 全新部署项目...${NC}"
    
    # 创建安装目录
    run_step "创建安装目录" "mkdir -p '$INSTALL_DIR'"
    
    # 克隆最新代码
    run_step "克隆最新代码" "git clone -b gh-pages https://github.com/jichenghan800/jstack-review.git '$INSTALL_DIR'"
    
    # 进入项目目录
    cd "$INSTALL_DIR"
    
    # 安装项目依赖
    run_step "安装项目依赖" "npm install"
    
    # 设置权限
    run_step "设置脚本权限" "chmod +x *.sh"
    
    # 创建日志目录
    run_step "创建日志目录" "mkdir -p logs"
}

# 4. 配置服务
configure_services() {
    echo -e "\n${BLUE}⚙️ 配置服务...${NC}"
    
    # 配置防火墙
    if command -v ufw &> /dev/null; then
        run_step "配置防火墙" "ufw --force enable && ufw allow $PORT/tcp && ufw allow $BEDROCK_PORT/tcp"
    fi
    
    # 创建systemd服务
    run_step "创建系统服务" "tee /etc/systemd/system/jstack-analyzer.service > /dev/null << EOF
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
EOF"
    
    run_step "重载系统服务" "systemctl daemon-reload"
    run_step "启用自启动" "systemctl enable jstack-analyzer.service"
}

# 5. 启动服务
start_services() {
    echo -e "\n${BLUE}🚀 启动服务...${NC}"
    
    cd "$INSTALL_DIR"
    
    # 确保端口没有被占用
    run_step "检查端口占用" "! netstat -tlnp 2>/dev/null | grep -q ':$PORT ' && ! netstat -tlnp 2>/dev/null | grep -q ':$BEDROCK_PORT '"
    
    # 启动Bedrock服务
    if [ -f "bedrock-test-server.js" ]; then
        nohup node bedrock-test-server.js > logs/bedrock.log 2>&1 &
        BEDROCK_PID=$!
        echo -e "Bedrock服务已启动 (PID: $BEDROCK_PID) ${GREEN}✓${NC}"
    fi
    
    # 启动Web服务
    nohup python3 -m http.server $PORT > logs/web.log 2>&1 &
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
    
    # 保存PID信息
    echo "$WEB_PID" > "$INSTALL_DIR/web.pid"
    echo "$BEDROCK_PID" > "$INSTALL_DIR/bedrock.pid"
}

# 6. 显示完成信息
show_completion() {
    local server_ip=$(curl -s --connect-timeout 5 ifconfig.me 2>/dev/null || echo "YOUR_SERVER_IP")
    
    echo ""
    echo "🎉🎉🎉 重新部署完成！🎉🎉🎉"
    echo ""
    echo -e "${GREEN}✅ 全新安装完成，所有服务已启动${NC}"
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
    
    echo -e "${BLUE}📋 部署信息:${NC}"
    echo "  📁 安装目录: $INSTALL_DIR"
    echo "  🌐 Web端口: $PORT"
    echo "  🔧 Bedrock端口: $BEDROCK_PORT"
    echo "  📄 日志目录: $INSTALL_DIR/logs/"
    echo ""
    echo -e "${BLUE}🔧 服务管理:${NC}"
    echo "  启动: sudo systemctl start jstack-analyzer"
    echo "  停止: sudo systemctl stop jstack-analyzer"
    echo "  重启: sudo systemctl restart jstack-analyzer"
    echo "  状态: sudo systemctl status jstack-analyzer"
    echo ""
    echo -e "${YELLOW}🔑 配置AI服务:${NC}"
    echo "  • OpenAI: 需要API Key (https://platform.openai.com)"
    echo "  • AWS Bedrock: 需要AWS凭证 (Access Key + Secret Key)"
    echo ""
    echo -e "${GREEN}🎊 享受全新的AI增强线程分析体验！${NC}"
    
    # 保存部署信息
    cat > "$INSTALL_DIR/deployment-info.txt" << EOF
重新部署时间: $(date)
安装目录: $INSTALL_DIR
Web端口: $PORT
Bedrock端口: $BEDROCK_PORT
Web服务PID: $WEB_PID
Bedrock服务PID: $BEDROCK_PID

访问地址:
- 主页: http://localhost:$PORT/
- AI分析器: http://localhost:$PORT/ai-simple.html
- 传统分析器: http://localhost:$PORT/test.html

服务管理:
- 启动: sudo systemctl start jstack-analyzer
- 停止: sudo systemctl stop jstack-analyzer
- 重启: sudo systemctl restart jstack-analyzer
- 状态: sudo systemctl status jstack-analyzer

日志文件:
- Web服务: $INSTALL_DIR/logs/web.log
- Bedrock服务: $INSTALL_DIR/logs/bedrock.log
EOF
}

# 主函数
main() {
    cleanup_existing
    install_dependencies
    deploy_fresh
    configure_services
    start_services
    show_completion
}

# 错误处理
handle_error() {
    echo ""
    echo -e "${RED}❌ 重新部署过程中发生错误！${NC}"
    echo -e "${YELLOW}💡 建议:${NC}"
    echo "1. 检查网络连接和权限"
    echo "2. 手动清理: rm -rf $INSTALL_DIR"
    echo "3. 重新运行部署脚本"
    echo ""
    exit 1
}

trap handle_error ERR

# 运行主函数
main "$@"

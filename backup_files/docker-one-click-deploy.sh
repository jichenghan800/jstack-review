#!/bin/bash

# JStack Review AI Analyzer - Docker一键部署脚本
# 适用于任何安装了Docker的服务器
# 使用方法: curl -fsSL https://raw.githubusercontent.com/jichenghan800/jstack-review/gh-pages/docker-one-click-deploy.sh | bash

set -e

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 配置变量
PROJECT_NAME="jstack-review"
GITHUB_REPO="https://github.com/jichenghan800/jstack-review.git"
GITHUB_BRANCH="gh-pages"
INSTALL_DIR="/opt/$PROJECT_NAME"
WEB_PORT=${WEB_PORT:-8080}
API_PORT=${API_PORT:-8082}
PROXY_PORT=${PROXY_PORT:-8081}
TEST_PORT=${TEST_PORT:-3002}

echo -e "${CYAN}🐳 JStack Review AI Analyzer - Docker一键部署${NC}"
echo "=================================================================="
echo -e "${YELLOW}Web端口: $WEB_PORT | API端口: $API_PORT | 代理端口: $PROXY_PORT | 测试端口: $TEST_PORT${NC}"
echo ""

# 检查执行函数
run_step() {
    local desc="$1"
    local cmd="$2"
    echo -n "$desc... "
    
    if eval "$cmd" >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
        return 0
    else
        echo -e "${RED}❌${NC}"
        echo -e "${RED}命令失败: $cmd${NC}"
        return 1
    fi
}

# 检查系统和依赖
check_dependencies() {
    echo -e "\n${BLUE}检查系统依赖...${NC}"
    
    # 检查Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker未安装，正在安装...${NC}"
        install_docker
    else
        echo -e "Docker已安装 ${GREEN}✓${NC}"
        docker --version
    fi
    
    # 检查Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        echo -e "${YELLOW}⚠️ Docker Compose未找到，正在安装...${NC}"
        install_docker_compose
    else
        echo -e "Docker Compose已安装 ${GREEN}✓${NC}"
    fi
    
    # 检查Git
    if ! command -v git &> /dev/null; then
        echo -e "${YELLOW}⚠️ Git未安装，正在安装...${NC}"
        install_git
    else
        echo -e "Git已安装 ${GREEN}✓${NC}"
    fi
}

# 安装Docker
install_docker() {
    echo -e "${BLUE}安装Docker...${NC}"
    
    # 检测系统类型
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$NAME
    else
        echo -e "${RED}无法检测系统类型${NC}"
        exit 1
    fi
    
    case $OS in
        "Ubuntu"*|"Debian"*)
            run_step "更新包列表" "apt update"
            run_step "安装依赖" "apt install -y apt-transport-https ca-certificates curl gnupg lsb-release"
            run_step "添加Docker GPG密钥" "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg"
            run_step "添加Docker仓库" "echo 'deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu focal stable' > /etc/apt/sources.list.d/docker.list"
            run_step "更新包列表" "apt update"
            run_step "安装Docker" "apt install -y docker-ce docker-ce-cli containerd.io"
            ;;
        "CentOS"*|"Red Hat"*|"Rocky"*|"AlmaLinux"*)
            run_step "安装依赖" "yum install -y yum-utils"
            run_step "添加Docker仓库" "yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo"
            run_step "安装Docker" "yum install -y docker-ce docker-ce-cli containerd.io"
            ;;
        *)
            echo -e "${RED}不支持的系统类型: $OS${NC}"
            echo -e "${YELLOW}请手动安装Docker后重新运行此脚本${NC}"
            exit 1
            ;;
    esac
    
    run_step "启动Docker服务" "systemctl start docker"
    run_step "设置Docker开机自启" "systemctl enable docker"
    run_step "添加用户到docker组" "usermod -aG docker $USER || true"
}

# 安装Docker Compose
install_docker_compose() {
    echo -e "${BLUE}安装Docker Compose...${NC}"
    local compose_version="2.20.2"
    run_step "下载Docker Compose" "curl -L 'https://github.com/docker/compose/releases/download/v$compose_version/docker-compose-$(uname -s)-$(uname -m)' -o /usr/local/bin/docker-compose"
    run_step "设置执行权限" "chmod +x /usr/local/bin/docker-compose"
    run_step "创建符号链接" "ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose"
}

# 安装Git
install_git() {
    if command -v apt &> /dev/null; then
        run_step "安装Git" "apt install -y git"
    elif command -v yum &> /dev/null; then
        run_step "安装Git" "yum install -y git"
    else
        echo -e "${RED}无法安装Git，请手动安装${NC}"
        exit 1
    fi
}

# 部署项目
deploy_project() {
    echo -e "\n${BLUE}部署项目...${NC}"
    
    # 创建安装目录
    run_step "创建安装目录" "mkdir -p $INSTALL_DIR"
    
    # 克隆或更新项目
    if [ -d "$INSTALL_DIR/.git" ]; then
        echo -e "项目已存在，正在更新... ${YELLOW}↻${NC}"
        cd "$INSTALL_DIR"
        run_step "拉取最新代码" "git pull origin $GITHUB_BRANCH"
    else
        run_step "克隆项目代码" "git clone -b $GITHUB_BRANCH $GITHUB_REPO $INSTALL_DIR"
        cd "$INSTALL_DIR"
    fi
    
    # 设置环境变量
    echo -e "\n${BLUE}配置环境变量...${NC}"
    cat > .env << EOF
# JStack Review Docker部署配置
WEB_PORT=$WEB_PORT
API_PORT=$API_PORT  
PROXY_PORT=$PROXY_PORT
TEST_PORT=$TEST_PORT
NODE_ENV=production
EOF
    
    echo -e "环境配置已保存到 .env ${GREEN}✓${NC}"
}

# 启动服务
start_services() {
    echo -e "\n${BLUE}启动Docker服务...${NC}"
    
    cd "$INSTALL_DIR"
    
    # 停止现有容器
    echo -e "${YELLOW}停止现有容器...${NC}"
    docker-compose down 2>/dev/null || true
    
    # 构建并启动服务
    run_step "构建Docker镜像" "docker-compose build --no-cache"
    run_step "启动所有服务" "docker-compose up -d"
    
    # 等待服务启动
    echo -e "\n${YELLOW}等待服务启动...${NC}"
    sleep 10
    
    # 检查服务状态
    echo -e "\n${BLUE}检查服务状态...${NC}"
    docker-compose ps
    
    # 健康检查
    local max_attempts=12
    local attempt=1
    
    echo -e "\n${BLUE}执行健康检查...${NC}"
    while [ $attempt -le $max_attempts ]; do
        echo -n "检查Web服务 (尝试 $attempt/$max_attempts)... "
        if curl -sf http://localhost:$WEB_PORT >/dev/null 2>&1; then
            echo -e "${GREEN}✓${NC}"
            break
        else
            echo -e "${YELLOW}等待中...${NC}"
            sleep 5
            ((attempt++))
        fi
    done
    
    if [ $attempt -gt $max_attempts ]; then
        echo -e "${RED}❌ Web服务启动超时${NC}"
        echo -e "${YELLOW}查看日志: docker-compose logs${NC}"
    fi
}

# 配置防火墙
configure_firewall() {
    echo -e "\n${BLUE}配置防火墙...${NC}"
    
    # 检查并配置iptables/ufw
    if command -v ufw &> /dev/null; then
        run_step "开放Web端口" "ufw allow $WEB_PORT/tcp" || true
        run_step "开放API端口" "ufw allow $API_PORT/tcp" || true  
        run_step "开放代理端口" "ufw allow $PROXY_PORT/tcp" || true
        run_step "开放测试端口" "ufw allow $TEST_PORT/tcp" || true
    elif command -v firewall-cmd &> /dev/null; then
        run_step "开放Web端口" "firewall-cmd --permanent --add-port=$WEB_PORT/tcp" || true
        run_step "开放API端口" "firewall-cmd --permanent --add-port=$API_PORT/tcp" || true
        run_step "开放代理端口" "firewall-cmd --permanent --add-port=$PROXY_PORT/tcp" || true
        run_step "开放测试端口" "firewall-cmd --permanent --add-port=$TEST_PORT/tcp" || true
        run_step "重载防火墙配置" "firewall-cmd --reload" || true
    fi
}

# 显示部署结果
show_completion() {
    local server_ip=$(curl -s --connect-timeout 5 ifconfig.me 2>/dev/null || echo "YOUR_SERVER_IP")
    
    echo ""
    echo "🎉🎉🎉 Docker部署完成！🎉🎉🎉"
    echo ""
    echo -e "${GREEN}✅ 所有服务已通过Docker容器启动${NC}"
    echo ""
    echo -e "${CYAN}📱 本地访问地址:${NC}"
    echo "  🏠 主页:        http://localhost:$WEB_PORT/"
    echo "  🤖 AI分析器:    http://localhost:$WEB_PORT/ai-simple.html"
    echo "  🔧 传统分析器:  http://localhost:$WEB_PORT/test.html"
    echo "  📊 API服务:     http://localhost:$API_PORT/health"
    echo "  🔗 代理服务:    http://localhost:$PROXY_PORT/api/default-config"
    echo ""
    
    if [ "$server_ip" != "YOUR_SERVER_IP" ]; then
        echo -e "${YELLOW}🌐 外网访问地址:${NC}"
        echo "  🤖 AI分析器:    http://$server_ip:$WEB_PORT/ai-simple.html"  
        echo "  🔧 传统分析器:  http://$server_ip:$WEB_PORT/test.html"
        echo ""
    fi
    
    echo -e "${BLUE}🐳 Docker管理命令:${NC}"
    echo "  📁 项目目录:    cd $INSTALL_DIR"
    echo "  🔍 查看状态:    docker-compose ps"
    echo "  📋 查看日志:    docker-compose logs -f"
    echo "  🔄 重启服务:    docker-compose restart"
    echo "  🛑 停止服务:    docker-compose down"
    echo "  🗑️ 完全清理:    docker-compose down -v --rmi all"
    echo ""
    echo -e "${YELLOW}🔑 配置AI服务:${NC}"
    echo "  • OpenAI: 需要API Key (https://platform.openai.com)"
    echo "  • AWS Bedrock: 需要AWS凭证配置"
    echo ""
    echo -e "${GREEN}🎊 开始使用Docker版AI增强线程分析器！${NC}"
    echo ""
    echo -e "${CYAN}💡 提示: 所有服务运行在Docker容器中，数据持久化已配置${NC}"
}

# 错误处理
handle_error() {
    echo ""
    echo -e "${RED}❌ Docker部署过程中发生错误！${NC}"
    echo -e "${YELLOW}💡 故障排除建议:${NC}"
    echo "1. 检查Docker服务状态: systemctl status docker"
    echo "2. 查看容器日志: docker-compose logs"
    echo "3. 检查端口占用: netstat -tlnp | grep '$WEB_PORT\\|$API_PORT'"
    echo "4. 重新构建: docker-compose build --no-cache"
    echo ""
    echo -e "${BLUE}📞 获取帮助:${NC}"
    echo "GitHub Issues: https://github.com/jichenghan800/jstack-review/issues"
    exit 1
}

# 主函数
main() {
    # 检查是否为root用户
    if [[ $EUID -ne 0 ]]; then
        echo -e "${RED}❌ 此脚本需要root权限运行${NC}"
        echo -e "${YELLOW}请使用: sudo $0${NC}"
        exit 1
    fi
    
    check_dependencies
    deploy_project  
    start_services
    configure_firewall
    show_completion
}

# 设置错误处理
trap handle_error ERR

# 运行主函数
main "$@"
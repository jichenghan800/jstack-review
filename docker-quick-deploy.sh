#!/bin/bash

# JStack Review Docker 快速部署脚本
# 简化版本，专注于快速部署到新服务器

set -e

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_NAME="jstack-review"
INSTALL_DIR="/opt/$PROJECT_NAME"

echo -e "${BLUE}🐳 JStack Review - Docker快速部署${NC}"
echo "========================================"

# 一键安装Docker (Ubuntu/Debian)
install_docker_ubuntu() {
    echo -e "${BLUE}安装Docker...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    sudo systemctl start docker
    sudo systemctl enable docker
    rm -f get-docker.sh
}

# 检查并安装Docker
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker未安装，正在安装...${NC}"
    install_docker_ubuntu
else
    echo -e "Docker已安装 ${GREEN}✓${NC}"
fi

# 检查Docker Compose
if ! docker compose version &> /dev/null; then
    echo -e "${RED}需要Docker Compose v2${NC}"
    exit 1
fi

# 克隆项目
echo -e "\n${BLUE}获取项目代码...${NC}"
if [ -d "$INSTALL_DIR" ]; then
    cd "$INSTALL_DIR" && git pull origin gh-pages
else
    sudo mkdir -p "$INSTALL_DIR"
    sudo chown $USER:$USER "$INSTALL_DIR"
    git clone -b gh-pages https://github.com/jichenghan800/jstack-review.git "$INSTALL_DIR"
fi

# 部署
cd "$INSTALL_DIR"
echo -e "\n${BLUE}启动服务...${NC}"
docker compose down 2>/dev/null || true
docker compose up -d --build

echo -e "\n${GREEN}🎉 部署完成！${NC}"
echo -e "${YELLOW}访问地址: http://$(curl -s ifconfig.me):8080/ai-simple.html${NC}"
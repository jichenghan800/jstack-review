#!/bin/bash

# Java Thread Dump Analyzer - 快速部署脚本
# 适用于 Ubuntu 系统

set -e

echo "🚀 Java Thread Dump Analyzer - 快速部署"
echo "=========================================="

# 更新系统
echo "📦 更新系统包..."
sudo apt update && sudo apt upgrade -y

# 安装基础依赖
echo "🔧 安装基础依赖..."
sudo apt install -y curl wget git nodejs npm python3 python3-pip unzip

# 安装AWS CLI (可选)
echo "☁️ 安装AWS CLI..."
if ! command -v aws &> /dev/null; then
    cd /tmp
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip -q awscliv2.zip
    sudo ./aws/install
fi

# 克隆项目
echo "📥 克隆项目..."
INSTALL_DIR="$HOME/jstack-review"
if [ -d "$INSTALL_DIR" ]; then
    echo "⚠️ 目录已存在，正在更新..."
    cd "$INSTALL_DIR"
    git pull origin gh-pages
else
    git clone -b gh-pages https://github.com/jichenghan800/jstack-review.git "$INSTALL_DIR"
fi

# 安装依赖
echo "📚 安装项目依赖..."
cd "$INSTALL_DIR"
npm install

# 设置权限
chmod +x *.sh

echo ""
echo "✅ 部署完成！"
echo ""
echo "🌐 启动服务:"
echo "   cd $INSTALL_DIR"
echo "   ./start-all.sh"
echo ""
echo "📱 访问地址:"
echo "   http://localhost:8080/ai-simple.html"
echo ""

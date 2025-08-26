#!/bin/bash

# JStack Review - 快速部署脚本 (适用于已有Docker和Node.js环境)
# 专为已配置好基础环境的服务器设计

set -e

PROJECT_NAME="jstack-review"
REPO_URL="https://github.com/jichenghan800/jstack-review.git"
INSTALL_DIR="/opt/$PROJECT_NAME"

echo "⚡ JStack Review - 快速部署 (轻量版)"
echo "======================================"
echo "适用于：已有Docker和Node.js环境的服务器"
echo ""

# 简单状态输出
log() { echo "📍 $1"; }
success() { echo "✅ $1"; }
error() { echo "❌ $1"; exit 1; }

# 快速环境检查
log "检查运行环境..."
command -v git >/dev/null 2>&1 || error "需要安装git"
command -v node >/dev/null 2>&1 || error "需要安装Node.js 16+"
command -v docker >/dev/null 2>&1 || error "需要安装Docker"
success "环境检查通过"

# 清理并克隆项目
log "获取最新代码..."
[ -d "$INSTALL_DIR" ] && rm -rf "$INSTALL_DIR"
git clone "$REPO_URL" "$INSTALL_DIR"
cd "$INSTALL_DIR"
success "代码获取完成"

# 安装依赖和部署
log "安装依赖并部署..."
npm install --only=production
mkdir -p logs config

# 创建配置文件
[ -f "config.example.json" ] && [ ! -f "config.json" ] && cp config.example.json config.json

# 使用最健壮的部署方案
chmod +x *.sh
if ./docker-proxy-deploy-robust.sh > deploy.log 2>&1; then
    success "部署完成"
else
    error "部署失败，查看 $INSTALL_DIR/deploy.log 了解详情"
fi

# 快速验证
log "验证服务..."
sleep 5
if curl -s http://localhost:8080 >/dev/null 2>&1; then
    success "🎉 JStack Review 部署成功！"
    echo ""
    echo "🌐 访问地址: http://localhost:8080/ai-simple.html"
    echo "📍 安装位置: $INSTALL_DIR"
    echo "🔧 管理命令: cd $INSTALL_DIR && ./stop-all-services.sh"
else
    error "服务验证失败"
fi
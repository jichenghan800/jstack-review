#!/bin/bash
# Java Thread Dump Analyzer - 超简单一键部署
# 支持全新安装和重新部署
# curl -fsSL https://raw.githubusercontent.com/jichenghan800/jstack-review/gh-pages/install.sh | bash
# 重新部署: curl -fsSL https://raw.githubusercontent.com/jichenghan800/jstack-review/gh-pages/install.sh | bash -s -- --redeploy

# 检查参数
REDEPLOY=false
if [[ "$1" == "--redeploy" ]] || [[ "$2" == "--redeploy" ]]; then
    REDEPLOY=true
fi

if $REDEPLOY; then
    echo "🔄 开始重新部署..."
else
    echo "🚀 开始一键部署..."
fi

# 适配root用户
if [[ $EUID -eq 0 ]]; then
    INSTALL_DIR="/opt/jstack-review"
else
    INSTALL_DIR="$HOME/jstack-review"
fi

# 重新部署：完全清理
if $REDEPLOY; then
    echo "🧹 清理现有安装..."
    
    # 停止服务
    pkill -f "http.server 8080" > /dev/null 2>&1 || true
    pkill -f "bedrock-test-server" > /dev/null 2>&1 || true
    sleep 2
    
    # 删除目录
    [ -d "$INSTALL_DIR" ] && rm -rf "$INSTALL_DIR"
    [ -d "$INSTALL_DIR.backup" ] && rm -rf "$INSTALL_DIR.backup"
    
    # 清理系统服务
    if [ -f "/etc/systemd/system/jstack-analyzer.service" ]; then
        systemctl stop jstack-analyzer > /dev/null 2>&1 || true
        systemctl disable jstack-analyzer > /dev/null 2>&1 || true
        rm -f /etc/systemd/system/jstack-analyzer.service
        systemctl daemon-reload > /dev/null 2>&1 || true
    fi
    
    # 清理缓存
    command -v npm &> /dev/null && npm cache clean --force > /dev/null 2>&1 || true
    
    echo "✅ 清理完成"
fi

# 安装依赖 (静默处理错误)
echo "📦 安装依赖..."
apt update > /dev/null 2>&1 || true
DEBIAN_FRONTEND=noninteractive apt install -y curl git nodejs npm python3 > /dev/null 2>&1 || {
    echo "⚠️ 部分依赖安装失败，尝试继续..."
}

# 克隆项目
echo "📥 下载最新项目..."
if [ -d "$INSTALL_DIR" ] && ! $REDEPLOY; then
    echo "📁 目录已存在，更新代码..."
    cd "$INSTALL_DIR"
    git pull origin gh-pages > /dev/null 2>&1 || {
        echo "⚠️ 更新失败，重新克隆..."
        cd ..
        rm -rf "$INSTALL_DIR"
        git clone -b gh-pages https://github.com/jichenghan800/jstack-review.git "$INSTALL_DIR" > /dev/null 2>&1
    }
else
    git clone -b gh-pages https://github.com/jichenghan800/jstack-review.git "$INSTALL_DIR" > /dev/null 2>&1 || {
        echo "❌ 项目下载失败，请检查网络连接"
        exit 1
    }
fi

# 安装和启动
echo "🔧 配置项目..."
cd "$INSTALL_DIR"
npm install > /dev/null 2>&1 || echo "⚠️ npm依赖安装可能有问题"
chmod +x *.sh > /dev/null 2>&1

# 创建日志目录
mkdir -p logs > /dev/null 2>&1

# 停止可能存在的服务
pkill -f "http.server 8080" > /dev/null 2>&1 || true
pkill -f "bedrock-test-server" > /dev/null 2>&1 || true
sleep 1

# 启动服务
echo "🚀 启动服务..."
nohup node bedrock-test-server.js > logs/bedrock.log 2>&1 &
BEDROCK_PID=$!
nohup python3 -m http.server 8080 > logs/web.log 2>&1 &
WEB_PID=$!

# 保存PID
echo "$WEB_PID" > web.pid
echo "$BEDROCK_PID" > bedrock.pid

sleep 2

# 获取服务器IP
SERVER_IP=$(curl -s --connect-timeout 3 ifconfig.me 2>/dev/null || echo "localhost")

if $REDEPLOY; then
    echo "✅ 重新部署完成！"
else
    echo "✅ 部署完成！"
fi

echo ""
echo "🌐 访问地址:"
echo "  🤖 AI分析器: http://$SERVER_IP:8080/ai-simple.html"
echo "  🔧 传统版本: http://$SERVER_IP:8080/test.html"
echo ""
echo "📁 安装目录: $INSTALL_DIR"
echo "📄 日志目录: $INSTALL_DIR/logs/"
echo ""
echo "🔄 重新部署命令:"
echo "curl -fsSL https://raw.githubusercontent.com/jichenghan800/jstack-review/gh-pages/install.sh | bash -s -- --redeploy"
echo ""
echo "🎊 开始使用吧！"

#!/bin/bash

echo "🔍 JStack Review 部署诊断工具"
echo "=================================="

# 检查系统环境
echo "📋 系统信息检查..."
echo "操作系统: $(uname -a)"
echo "当前用户: $(whoami)"
echo "当前目录: $(pwd)"
echo ""

# 检查必要的依赖
echo "🔧 依赖检查..."

# Node.js检查
if command -v node >/dev/null 2>&1; then
    echo "✅ Node.js: $(node --version)"
else
    echo "❌ Node.js 未安装"
fi

# NPM检查
if command -v npm >/dev/null 2>&1; then
    echo "✅ NPM: $(npm --version)"
else
    echo "❌ NPM 未安装"
fi

# Python检查
if command -v python3 >/dev/null 2>&1; then
    echo "✅ Python3: $(python3 --version)"
else
    echo "❌ Python3 未安装"
fi

# Docker检查
if command -v docker >/dev/null 2>&1; then
    echo "✅ Docker: $(docker --version)"
else
    echo "❌ Docker 未安装"
fi

echo ""

# 检查项目文件
echo "📁 项目文件检查..."
REQUIRED_FILES=(
    "package.json"
    "autogen-bedrock-server.js" 
    "bedrock-test-server.js"
    "ai-simple.html"
    "docker-proxy-deploy.sh"
    "nginx-proxy.conf"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (缺失)"
    fi
done

echo ""

# 检查npm依赖
echo "📦 NPM依赖检查..."
if [ -f "package.json" ]; then
    if [ -d "node_modules" ]; then
        echo "✅ node_modules 目录存在"
        # 检查关键依赖
        if [ -d "node_modules/express" ]; then
            echo "✅ Express已安装"
        else
            echo "❌ Express未安装"
        fi
        if [ -d "node_modules/@aws-sdk" ]; then
            echo "✅ AWS SDK已安装"
        else
            echo "❌ AWS SDK未安装"
        fi
    else
        echo "❌ node_modules 目录不存在，需要运行 npm install"
    fi
else
    echo "❌ package.json 不存在"
fi

echo ""

# 检查端口占用
echo "🔌 端口占用检查..."
PORTS=(8080 8082 3002)
for port in "${PORTS[@]}"; do
    if lsof -i :$port >/dev/null 2>&1; then
        echo "⚠️  端口 $port 被占用: $(lsof -i :$port | tail -n +2)"
    else
        echo "✅ 端口 $port 空闲"
    fi
done

echo ""

# 检查日志文件
echo "📋 日志文件检查..."
if [ -d "logs" ]; then
    echo "✅ logs 目录存在"
    for logfile in logs/*.log; do
        if [ -f "$logfile" ]; then
            echo "📄 $logfile ($(wc -l < "$logfile") 行)"
            echo "   最后几行:"
            tail -n 3 "$logfile" | sed 's/^/     /'
        fi
    done
else
    echo "❌ logs 目录不存在"
fi

echo ""

# 提供修复建议
echo "🔧 修复建议..."

if ! command -v node >/dev/null 2>&1; then
    echo "1. 安装Node.js:"
    echo "   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    echo "   sudo apt-get install -y nodejs"
fi

if [ ! -d "node_modules" ]; then
    echo "2. 安装NPM依赖:"
    echo "   npm install"
fi

if [ ! -d "logs" ]; then
    echo "3. 创建logs目录:"
    echo "   mkdir -p logs"
fi

echo ""
echo "🚀 修复完成后，重新运行:"
echo "   ./docker-proxy-deploy.sh"
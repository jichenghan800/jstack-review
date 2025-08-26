#!/bin/bash

# JStack Review - Single Port Startup Script
# Unified 8080 port for both static files and API proxy
# Copyright 2025

set -e  # Exit on any error

echo "🚀 启动 JStack Review AI 分析器 (单端口模式)"
echo "================================================"

# 进入项目目录
cd "$(dirname "$0")"

# 检查依赖
echo "🔍 检查依赖..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 未安装"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "⚠️  依赖未安装，正在安装..."
    npm install
fi

echo "✅ 依赖检查完成"

# 创建日志目录
mkdir -p logs

# 停止已存在的服务
echo "🛑 停止已存在的服务..."
pkill -f "python3 -m http.server 8080" 2>/dev/null || true
pkill -f "unified-server.py" 2>/dev/null || true
pkill -f "autogen-bedrock-server.js" 2>/dev/null || true
pkill -f "bedrock-test-server.js" 2>/dev/null || true
pkill -f "proxy-server.py" 2>/dev/null || true

# 等待进程完全停止
sleep 2

# 启动AutoGen Bedrock服务器 (内部端口 8082)
echo "🤖 启动AutoGen Bedrock服务器 (内部端口 8082)..."
nohup node autogen-bedrock-server.js > logs/autogen-bedrock.log 2>&1 &
AUTOGEN_PID=$!

# 启动统一HTTP服务器 (对外端口 8080)
echo "🌐 启动统一HTTP服务器 (对外端口 8080)..."
nohup python3 unified-server.py > logs/unified-server.log 2>&1 &
WEB_PID=$!

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 3

# 健康检查
echo "🔍 检查服务状态..."
SERVICES_OK=true

# 检查统一HTTP服务器（静态文件）
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 | grep -q "200"; then
    echo "✅ 统一HTTP服务器运行正常 (端口 8080)"
else
    echo "❌ 统一HTTP服务器启动失败"
    SERVICES_OK=false
fi

# 检查API代理功能
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/default-config | grep -q "200"; then
    echo "✅ API代理功能运行正常"
else
    echo "❌ API代理功能启动失败"
    SERVICES_OK=false
fi

# 检查AutoGen后端服务器
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/health | grep -q "200"; then
    echo "✅ AutoGen后端服务器运行正常 (内部端口 8082)"
else
    echo "❌ AutoGen后端服务器启动失败"
    SERVICES_OK=false
fi

if [ "$SERVICES_OK" = true ]; then
    echo ""
    echo "🎉 单端口部署成功！"
    echo "================================================"
    echo "🌐 应用访问地址: http://localhost:8080"
    echo "📱 AI增强分析器: http://localhost:8080/ai-simple.html"
    echo "🔧 传统分析器: http://localhost:8080/test.html"
    echo ""
    echo "🔒 安全架构:"
    echo "   对外端口: 8080 (统一HTTP服务器)"
    echo "   内部端口: 8082 (AutoGen API服务器，不对外暴露)"
    echo ""
    echo "📁 日志文件:"
    echo "   统一服务器: tail -f logs/unified-server.log"
    echo "   AutoGen API: tail -f logs/autogen-bedrock.log"
    echo ""
    echo "🛑 停止服务: ./stop-all-services.sh"
    echo ""
    echo "💡 AWS凭证已配置，可直接使用AI分析功能"
else
    echo ""
    echo "❌ 部分服务启动失败，请检查日志文件"
    echo "📋 日志位置: logs/"
    exit 1
fi
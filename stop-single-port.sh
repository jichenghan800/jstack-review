#!/bin/bash

# JStack Review - Stop Single Port Services
# 停止单端口NPM部署的所有服务
# Copyright 2025

echo "🛑 停止 JStack Review 单端口服务..."
echo "========================================"

# 进入项目目录
cd "$(dirname "$0")"

# 停止统一HTTP服务器（端口8080）
echo "🌐 停止统一HTTP服务器（端口8080）..."
pkill -f "unified-server.py" 2>/dev/null && echo "   ✅ 统一HTTP服务器已停止" || echo "   ℹ️  统一HTTP服务器未运行"

# 停止AutoGen Bedrock服务器（内部端口8082）
echo "🤖 停止AutoGen Bedrock服务器（内部端口8082）..."
pkill -f "autogen-bedrock-server.js" 2>/dev/null && echo "   ✅ AutoGen服务器已停止" || echo "   ℹ️  AutoGen服务器未运行"

# 等待进程完全停止
sleep 2

# 检查端口占用
echo ""
echo "🔍 检查端口状态..."
if lsof -i :8080 >/dev/null 2>&1; then
    echo "   ⚠️  端口8080仍被占用"
    lsof -i :8080
else
    echo "   ✅ 端口8080已释放"
fi

if lsof -i :8082 >/dev/null 2>&1; then
    echo "   ⚠️  内部端口8082仍被占用"
    lsof -i :8082
else
    echo "   ✅ 内部端口8082已释放"
fi

echo ""
echo "✅ JStack Review 单端口服务已全部停止"
echo ""
echo "💡 重新启动服务: ./start-single-port.sh"
echo "📋 查看日志: tail -f logs/*.log"
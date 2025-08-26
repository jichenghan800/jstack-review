#!/bin/bash

# JStack Review - Stop All Services
# Stops all services started by start-all-services.sh
# Copyright 2025

echo "🛑 停止 JStack Review 所有服务..."
echo "======================================="

# 停止Web服务器
if pgrep -f "python3 -m http.server 8080" > /dev/null; then
    echo "🌐 停止Web服务器..."
    pkill -f "python3 -m http.server 8080"
    echo "✅ Web服务器已停止"
else
    echo "ℹ️  Web服务器未运行"
fi

# 停止AutoGen Bedrock服务器  
if pgrep -f "autogen-bedrock-server.js" > /dev/null; then
    echo "🤖 停止AutoGen Bedrock服务器..."
    pkill -f "autogen-bedrock-server.js"
    echo "✅ AutoGen Bedrock服务器已停止"
else
    echo "ℹ️  AutoGen Bedrock服务器未运行"
fi

# 停止Bedrock测试服务器
if pgrep -f "bedrock-test-server.js" > /dev/null; then
    echo "🧪 停止Bedrock测试服务器..."
    pkill -f "bedrock-test-server.js"
    echo "✅ Bedrock测试服务器已停止"
else
    echo "ℹ️  Bedrock测试服务器未运行"
fi

# 停止API代理服务器
if pgrep -f "proxy-server.py" > /dev/null; then
    echo "🔗 停止API代理服务器..."
    pkill -f "proxy-server.py"
    echo "✅ API代理服务器已停止"
else
    echo "ℹ️  API代理服务器未运行"
fi

# 等待进程完全停止
sleep 1

echo ""
echo "🎉 所有服务已停止"
echo "💡 要重新启动，请运行: ./start-all-services.sh"
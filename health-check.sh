#!/bin/bash

# JStack Review - Health Check for Single Port Deployment
# 检查单端口部署的服务健康状态
# Copyright 2025

echo "🔍 JStack Review 单端口服务健康检查"
echo "=================================="

# 检查端口占用
echo "📡 端口状态检查:"
if lsof -i :8080 >/dev/null 2>&1; then
    echo "   ✅ 端口8080：正在使用（统一HTTP服务器）"
    UNIFIED_OK=true
else
    echo "   ❌ 端口8080：未使用"
    UNIFIED_OK=false
fi

if lsof -i :8082 >/dev/null 2>&1; then
    echo "   ✅ 端口8082：正在使用（AutoGen API服务器）"
    AUTOGEN_OK=true
else
    echo "   ❌ 端口8082：未使用"
    AUTOGEN_OK=false
fi

echo ""

# 检查进程状态
echo "🔄 进程状态检查:"
if pgrep -f "unified-server.py" >/dev/null; then
    echo "   ✅ 统一HTTP服务器：运行中"
else
    echo "   ❌ 统一HTTP服务器：未运行"
fi

if pgrep -f "autogen-bedrock-server.js" >/dev/null; then
    echo "   ✅ AutoGen API服务器：运行中"
else
    echo "   ❌ AutoGen API服务器：未运行"
fi

echo ""

# HTTP服务测试
echo "🌐 HTTP服务测试:"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 | grep -q "200"; then
    echo "   ✅ 静态文件服务：正常 (200)"
    STATIC_OK=true
else
    echo "   ❌ 静态文件服务：异常"
    STATIC_OK=false
fi

if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/default-config | grep -q "200"; then
    echo "   ✅ API代理服务：正常 (200)"
    API_PROXY_OK=true
else
    echo "   ❌ API代理服务：异常"
    API_PROXY_OK=false
fi

if curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/health | grep -q "200"; then
    echo "   ✅ AutoGen后端服务：正常 (200)"
    BACKEND_OK=true
else
    echo "   ❌ AutoGen后端服务：异常"
    BACKEND_OK=false
fi

echo ""

# 综合状态
if $UNIFIED_OK && $AUTOGEN_OK && $STATIC_OK && $API_PROXY_OK && $BACKEND_OK; then
    echo "🎉 系统状态：全部服务正常运行"
    echo "🌐 应用访问：http://localhost:8080/ai-simple.html"
    exit 0
else
    echo "⚠️  系统状态：部分服务异常"
    echo "💡 解决方案："
    echo "   1. 重启服务：./start-single-port.sh"
    echo "   2. 查看日志：tail -f logs/*.log"
    echo "   3. 检查依赖：npm install"
    exit 1
fi
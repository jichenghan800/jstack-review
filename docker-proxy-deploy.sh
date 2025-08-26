#!/bin/bash

# JStack Review - 完整代理服务部署脚本
# 包含完整的API代理功能

echo "🐳 JStack Review - 完整代理服务部署"
echo "=================================="

# 清理之前的容器
echo "🧹 清理旧容器..."
docker stop jstack-review-proxy 2>/dev/null || true
docker rm jstack-review-proxy 2>/dev/null || true

# 确保后端服务正在运行
echo "🚀 启动后端服务..."

# 启动AutoGen Bedrock服务
if ! pgrep -f "autogen-bedrock-server.js" > /dev/null; then
    echo "🤖 启动AutoGen Bedrock服务..."
    nohup node autogen-bedrock-server.js > logs/autogen-bedrock.log 2>&1 &
    sleep 2
fi

# 启动Bedrock测试服务
if ! pgrep -f "bedrock-test-server.js" > /dev/null; then
    echo "🧪 启动Bedrock测试服务..."
    nohup node bedrock-test-server.js > logs/bedrock-test.log 2>&1 &
    sleep 2
fi

# 启动带有完整代理配置的nginx容器
echo "🌐 启动Web服务器 (带API代理)..."
docker run -d \
  --name jstack-review-proxy \
  -p 8080:80 \
  --add-host host.docker.internal:host-gateway \
  -v $(pwd):/usr/share/nginx/html:ro \
  -v $(pwd)/nginx-proxy.conf:/etc/nginx/conf.d/default.conf:ro \
  nginx:alpine

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 5

# 健康检查
echo "🔍 检查服务状态..."
SERVICES_OK=true

# 检查Web服务器
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 | grep -q "200"; then
    echo "✅ Web服务器运行正常 (端口 8080)"
else
    echo "❌ Web服务器启动失败"
    SERVICES_OK=false
fi

# 检查AutoGen代理
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health | grep -q "200"; then
    echo "✅ AutoGen代理服务运行正常"
else
    echo "❌ AutoGen代理服务失败"
    SERVICES_OK=false
fi

# 检查后端服务
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/health | grep -q "200"; then
    echo "✅ AutoGen Bedrock后端运行正常 (端口 8082)"
else
    echo "❌ AutoGen Bedrock后端启动失败"
    SERVICES_OK=false
fi

if curl -s -o /dev/null http://localhost:3002/health 2>/dev/null; then
    echo "✅ Bedrock测试后端运行正常 (端口 3002)"
else
    echo "❌ Bedrock测试后端启动失败"
    SERVICES_OK=false
fi

if [ "$SERVICES_OK" = true ]; then
    echo ""
    echo "🎉 完整代理服务部署成功！"
    echo "=================================="
    echo "🌐 主应用地址: http://localhost:8080"
    echo "📱 AI增强分析器: http://localhost:8080/ai-simple.html"
    echo "🔧 传统分析器: http://localhost:8080/jstack-review-original/index.html"
    echo ""
    echo "🔗 API代理端点:"
    echo "   健康检查: http://localhost:8080/health"
    echo "   AutoGen API: http://localhost:8080/api/"
    echo "   测试API: http://localhost:8080/bedrock-test/"
    echo ""
    echo "🛑 停止服务:"
    echo "   docker stop jstack-review-proxy && docker rm jstack-review-proxy"
    echo "   pkill -f autogen-bedrock-server"
    echo "   pkill -f bedrock-test-server"
else
    echo ""
    echo "❌ 部分服务启动失败，请检查日志文件"
    echo "📋 日志位置: logs/"
    echo "📋 容器日志: docker logs jstack-review-proxy"
fi
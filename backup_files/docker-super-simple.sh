#!/bin/bash

# JStack Review - 最简单有效的Docker部署脚本
# 避开复杂配置，直接提供可用的服务

echo "🐳 JStack Review - 最简Docker部署"
echo "=================================="

# 清理之前的容器
echo "🧹 清理旧容器..."
docker stop jstack-review-simple 2>/dev/null || true
docker rm jstack-review-simple 2>/dev/null || true

# 启动最简单的nginx服务器
echo "🚀 启动Web服务..."
docker run -d \
  --name jstack-review-simple \
  -p 8080:80 \
  -v $(pwd):/usr/share/nginx/html:ro \
  nginx:alpine

# 启动本地AutoGen服务（如果可能）
if command -v node >/dev/null 2>&1; then
  echo "🤖 启动本地AutoGen服务..."
  nohup node autogen-bedrock-server.js > /dev/null 2>&1 &
  nohup node bedrock-test-server.js > /dev/null 2>&1 &
fi

echo ""
echo "🎉 部署完成！"
echo "====================="
echo "🌐 访问地址: http://localhost:8080"
echo "📱 AI分析器: http://localhost:8080/ai-simple.html"
echo "🔧 传统分析: http://localhost:8080/test.html"
echo ""
echo "⚡ 快速测试:"
echo "curl http://localhost:8080"
echo ""
echo "🛑 停止服务:"
echo "docker stop jstack-review-simple && docker rm jstack-review-simple"
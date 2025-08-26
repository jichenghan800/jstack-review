#!/bin/bash
# JStack Review AI Analyzer - 简化启动脚本（跳过代理服务）

echo "🚀 启动 JStack Review AI 分析器"
echo "================================================"

# 确保日志目录存在
mkdir -p logs

echo "🔍 检查依赖..."
if ! command -v node >/dev/null 2>&1; then
    echo "❌ Node.js 未安装"
    exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
    echo "❌ Python3 未安装"  
    exit 1
fi

echo "✅ 依赖检查完成"

# 停止已存在的服务
echo "🛑 停止已存在的服务..."
pkill -f "python.*http.server" >/dev/null 2>&1 || true
pkill -f "node.*autogen-bedrock-server" >/dev/null 2>&1 || true
pkill -f "node.*bedrock-test-server" >/dev/null 2>&1 || true
sleep 2

# 启动Web服务器 (端口 8080)
echo "🌐 启动Web服务器 (端口 8080)..."
nohup python3 -m http.server 8080 > logs/web-server.log 2>&1 &
WEB_PID=$!

# 启动AutoGen服务器 (端口 8082)
echo "🤖 启动AutoGen Bedrock服务器 (端口 8082)..."
nohup node autogen-bedrock-server.js > logs/autogen-bedrock.log 2>&1 &
AUTOGEN_PID=$!

# 启动Bedrock测试服务器 (端口 3002)
echo "🧪 启动Bedrock测试服务器 (端口 3002)..."
nohup node bedrock-test-server.js > logs/bedrock-test.log 2>&1 &
BEDROCK_PID=$!

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

# 检查AutoGen服务器
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/health | grep -q "200"; then
    echo "✅ AutoGen Bedrock服务器运行正常 (端口 8082)"
else
    echo "❌ AutoGen Bedrock服务器启动失败"
    SERVICES_OK=false
fi

# 检查Bedrock测试服务器
if curl -s -o /dev/null http://localhost:3002/health 2>/dev/null; then
    echo "✅ Bedrock测试服务器运行正常 (端口 3002)"
else
    echo "❌ Bedrock测试服务器启动失败"
    SERVICES_OK=false
fi

if [ "$SERVICES_OK" = true ]; then
    echo ""
    echo "🎉 主要服务启动成功！"
    echo "================================================"
    echo "🌐 主应用地址: http://localhost:8080"
    echo "📱 AI增强分析器: http://localhost:8080/ai-simple.html"
    echo "🔧 传统分析器: http://localhost:8080/jstack-review-original/index.html"
    echo ""
    echo "📋 服务状态:"
    echo "   Web服务器: http://localhost:8080"
    echo "   AutoGen API: http://localhost:8082"
    echo "   测试API: http://localhost:3002"
    echo ""
    echo "📁 日志文件:"
    echo "   Web: tail -f logs/web-server.log"
    echo "   AutoGen: tail -f logs/autogen-bedrock.log"
    echo "   测试服务: tail -f logs/bedrock-test.log"
    echo ""
    echo "🛑 停止所有服务: ./stop-all-services.sh"
    echo ""
    echo "💡 配置AWS凭证后即可使用AI分析功能"
else
    echo ""
    echo "❌ 部分服务启动失败，请检查日志文件"
    echo "📋 日志位置: logs/"
fi
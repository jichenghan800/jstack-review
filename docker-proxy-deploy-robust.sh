#!/bin/bash

# JStack Review - 完整代理服务部署脚本 (增强版)
# 包含依赖检查和自动修复功能

set -e  # 遇到错误立即退出

echo "🐳 JStack Review - 完整代理服务部署 (增强版)"
echo "=================================================="

# 检查依赖函数
check_dependencies() {
    echo "🔍 检查系统依赖..."
    
    # 检查Node.js
    if ! command -v node >/dev/null 2>&1; then
        echo "❌ Node.js 未安装"
        echo "请先安装Node.js 18+:"
        echo "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
        echo "sudo apt-get install -y nodejs"
        exit 1
    else
        echo "✅ Node.js: $(node --version)"
    fi
    
    # 检查Docker
    if ! command -v docker >/dev/null 2>&1; then
        echo "❌ Docker 未安装"
        echo "请先安装Docker"
        exit 1
    else
        echo "✅ Docker: $(docker --version)"
    fi
    
    # 检查项目文件
    REQUIRED_FILES=("package.json" "autogen-bedrock-server.js" "bedrock-test-server.js" "nginx-proxy.conf")
    for file in "${REQUIRED_FILES[@]}"; do
        if [ ! -f "$file" ]; then
            echo "❌ 缺失文件: $file"
            exit 1
        fi
    done
    echo "✅ 项目文件完整"
}

# 安装依赖函数
install_dependencies() {
    echo "📦 安装NPM依赖..."
    
    if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
        echo "正在安装NPM包..."
        npm install
        if [ $? -ne 0 ]; then
            echo "❌ NPM安装失败"
            exit 1
        fi
    else
        echo "✅ NPM依赖已存在"
    fi
}

# 创建必要目录和配置文件
create_directories() {
    echo "📁 创建必要目录和配置..."
    mkdir -p logs config
    
    # 如果config.json不存在，从example创建
    if [ ! -f "config.json" ] && [ -f "config.example.json" ]; then
        echo "📄 创建config.json配置文件..."
        cp config.example.json config.json
        echo "⚠️  请编辑config.json设置您的AWS凭证，或在浏览器中配置"
    fi
    
    echo "✅ 目录和配置创建完成"
}

# 停止旧进程函数
stop_old_processes() {
    echo "🛑 停止旧的后端服务..."
    
    # 停止Node.js进程
    pkill -f "autogen-bedrock-server.js" >/dev/null 2>&1 || true
    pkill -f "bedrock-test-server.js" >/dev/null 2>&1 || true
    
    # 等待进程完全停止
    sleep 2
    echo "✅ 旧进程清理完成"
}

# 启动后端服务函数
start_backend_services() {
    echo "🚀 启动后端服务..."
    
    # 启动AutoGen Bedrock服务
    echo "🤖 启动AutoGen Bedrock服务..."
    nohup node autogen-bedrock-server.js > logs/autogen-bedrock.log 2>&1 &
    AUTOGEN_PID=$!
    
    # 启动Bedrock测试服务
    echo "🧪 启动Bedrock测试服务..."
    nohup node bedrock-test-server.js > logs/bedrock-test.log 2>&1 &
    TEST_PID=$!
    
    # 等待服务启动
    echo "⏳ 等待后端服务启动..."
    sleep 5
    
    # 检查进程是否还在运行
    if ! kill -0 $AUTOGEN_PID 2>/dev/null; then
        echo "❌ AutoGen服务启动失败"
        echo "日志内容:"
        cat logs/autogen-bedrock.log
        exit 1
    fi
    
    if ! kill -0 $TEST_PID 2>/dev/null; then
        echo "❌ 测试服务启动失败"
        echo "日志内容:"
        cat logs/bedrock-test.log
        exit 1
    fi
    
    echo "✅ 后端服务启动成功"
}

# 主执行流程
main() {
    # 检查依赖
    check_dependencies
    
    # 创建目录
    create_directories
    
    # 安装依赖
    install_dependencies
    
    # 停止旧进程
    stop_old_processes
    
    # 清理旧容器
    echo "🧹 清理旧容器..."
    docker stop jstack-review-proxy 2>/dev/null || true
    docker rm jstack-review-proxy 2>/dev/null || true
    
    # 启动后端服务
    start_backend_services
    
    # 启动nginx容器
    echo "🌐 启动Web服务器 (带API代理)..."
    docker run -d \
      --name jstack-review-proxy \
      -p 8080:80 \
      --add-host host.docker.internal:host-gateway \
      -v $(pwd):/usr/share/nginx/html:ro \
      -v $(pwd)/nginx-proxy.conf:/etc/nginx/conf.d/default.conf:ro \
      nginx:alpine
    
    # 等待容器启动
    echo "⏳ 等待Web服务启动..."
    sleep 5
    
    # 健康检查
    echo "🔍 执行健康检查..."
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
        echo "检查nginx容器日志:"
        docker logs jstack-review-proxy --tail 10
        SERVICES_OK=false
    fi
    
    # 检查后端服务
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/health | grep -q "200"; then
        echo "✅ AutoGen Bedrock后端运行正常 (端口 8082)"
    else
        echo "❌ AutoGen Bedrock后端连接失败"
        echo "检查AutoGen日志:"
        tail -n 10 logs/autogen-bedrock.log
        SERVICES_OK=false
    fi
    
    if curl -s -o /dev/null http://localhost:3002/health 2>/dev/null; then
        echo "✅ Bedrock测试后端运行正常 (端口 3002)"
    else
        echo "❌ Bedrock测试后端连接失败"
        echo "检查测试服务日志:"
        tail -n 10 logs/bedrock-test.log
        SERVICES_OK=false
    fi
    
    # 显示结果
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
        echo "❌ 部分服务启动失败"
        echo "📋 故障排除:"
        echo "   1. 运行诊断工具: ./diagnose-deployment.sh"
        echo "   2. 查看详细日志: tail -f logs/*.log"
        echo "   3. 检查容器日志: docker logs jstack-review-proxy"
        echo "   4. 检查端口占用: lsof -i :8080 -i :8082 -i :3002"
        exit 1
    fi
}

# 陷阱处理：脚本被中断时清理资源
trap 'echo "🛑 部署被中断，清理资源..."; docker stop jstack-review-proxy 2>/dev/null || true; docker rm jstack-review-proxy 2>/dev/null || true; pkill -f autogen-bedrock-server 2>/dev/null || true; pkill -f bedrock-test-server 2>/dev/null || true; exit 1' INT TERM

# 执行主流程
main "$@"
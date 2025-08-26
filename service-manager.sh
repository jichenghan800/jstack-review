#!/bin/bash

# 通用服务启动和验证函数
# 使用方法: start_and_verify_service "服务名" "启动命令" "健康检查URL" "端口" "日志文件"

start_and_verify_service() {
    local service_name="$1"
    local start_command="$2" 
    local health_url="$3"
    local port="$4"
    local log_file="$5"
    local max_attempts=10
    local attempt=0

    echo "🚀 启动 $service_name..."

    # 停止已存在的进程
    pkill -f "$service_name" >/dev/null 2>&1 || true
    sleep 2

    # 启动服务
    eval "$start_command"
    local service_pid=$!

    # 等待并验证服务启动
    echo "⏳ 等待 $service_name 启动并验证健康状态..."
    
    while [ $attempt -lt $max_attempts ]; do
        attempt=$((attempt + 1))
        
        # 检查进程是否还活着
        if ! kill -0 $service_pid 2>/dev/null; then
            echo "❌ $service_name 进程异常退出"
            if [ -f "$log_file" ]; then
                echo "📋 错误日志:"
                tail -n 10 "$log_file"
            fi
            return 1
        fi
        
        # 检查端口是否监听
        if lsof -i :$port >/dev/null 2>&1; then
            echo "✅ $service_name 端口 $port 已监听"
            
            # 健康检查
            if curl -s -o /dev/null -w "%{http_code}" "$health_url" | grep -q "200"; then
                echo "✅ $service_name 健康检查通过"
                echo "📊 $service_name 启动成功 (尝试 $attempt/$max_attempts)"
                return 0
            fi
        fi
        
        echo "⏳ $service_name 启动中... (尝试 $attempt/$max_attempts)"
        sleep 3
    done
    
    echo "❌ $service_name 启动失败或健康检查超时"
    if [ -f "$log_file" ]; then
        echo "📋 最新日志:"
        tail -n 20 "$log_file"
    fi
    return 1
}

# 专门的AutoGen服务启动函数
start_autogen_service() {
    echo "🤖 准备启动AutoGen Bedrock服务..."
    
    # 确保必要文件存在
    if [ ! -f "autogen-bedrock-server.js" ]; then
        echo "❌ autogen-bedrock-server.js 不存在"
        return 1
    fi
    
    # 确保依赖已安装
    if [ ! -d "node_modules" ]; then
        echo "📦 安装NPM依赖..."
        npm install || return 1
    fi
    
    # 确保配置文件存在
    if [ ! -f "config.json" ] && [ -f "config.example.json" ]; then
        cp config.example.json config.json
        echo "📄 已创建config.json配置文件"
    fi
    
    # 启动服务
    start_and_verify_service \
        "autogen-bedrock-server.js" \
        "nohup node autogen-bedrock-server.js > logs/autogen-bedrock.log 2>&1 &" \
        "http://localhost:8082/health" \
        "8082" \
        "logs/autogen-bedrock.log"
}

# 专门的Bedrock测试服务启动函数  
start_bedrock_test_service() {
    echo "🧪 准备启动Bedrock测试服务..."
    
    if [ ! -f "bedrock-test-server.js" ]; then
        echo "❌ bedrock-test-server.js 不存在"
        return 1
    fi
    
    start_and_verify_service \
        "bedrock-test-server.js" \
        "nohup node bedrock-test-server.js > logs/bedrock-test.log 2>&1 &" \
        "http://localhost:3002/health" \
        "3002" \
        "logs/bedrock-test.log"
}

# 启动所有后端服务
start_all_backend_services() {
    echo "🔧 启动所有后端服务..."
    
    # 确保目录存在
    mkdir -p logs
    
    # 启动AutoGen服务
    if ! start_autogen_service; then
        echo "❌ AutoGen服务启动失败"
        return 1
    fi
    
    # 启动测试服务（可选）
    echo "🧪 尝试启动Bedrock测试服务..."
    if start_bedrock_test_service; then
        echo "✅ Bedrock测试服务启动成功"
    else
        echo "⚠️  Bedrock测试服务启动失败，但这是可选服务，继续..."
    fi
    
    echo "🎉 核心后端服务启动成功！"
    return 0
}

# 如果脚本被直接执行，则启动所有服务
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    start_all_backend_services
fi
#!/bin/bash

# JStack Review - 网络修复版部署脚本
# 使用宿主机网络模式解决502 Bad Gateway问题

set -e

echo "🔧 JStack Review - 网络修复版部署"
echo "=================================="

# 检查依赖
check_dependencies() {
    echo "🔍 检查系统依赖..."
    
    if ! command -v node >/dev/null 2>&1; then
        echo "❌ Node.js 未安装"
        exit 1
    else
        echo "✅ Node.js: $(node --version)"
    fi
    
    if ! command -v docker >/dev/null 2>&1; then
        echo "❌ Docker 未安装"
        exit 1
    else
        echo "✅ Docker: $(docker --version)"
    fi
}

# 创建目录和配置
setup_config() {
    echo "📁 设置配置和目录..."
    mkdir -p logs config
    
    if [ ! -f "config.json" ] && [ -f "config.example.json" ]; then
        cp config.example.json config.json
        echo "📄 已创建config.json配置文件"
    fi
    
    if [ ! -d "node_modules" ]; then
        echo "📦 安装NPM依赖..."
        npm install
    fi
}

# 停止旧服务
stop_old_services() {
    echo "🛑 停止旧服务..."
    
    # 停止容器
    docker stop jstack-review-proxy 2>/dev/null || true
    docker rm jstack-review-proxy 2>/dev/null || true
    
    # 停止后端进程
    pkill -f "autogen-bedrock-server.js" >/dev/null 2>&1 || true
    pkill -f "bedrock-test-server.js" >/dev/null 2>&1 || true
    
    sleep 2
}

# 启动后端服务
start_backend() {
    echo "🚀 启动后端服务..."
    
    # AutoGen服务
    nohup node autogen-bedrock-server.js > logs/autogen-bedrock.log 2>&1 &
    AUTOGEN_PID=$!
    
    # 测试服务
    nohup node bedrock-test-server.js > logs/bedrock-test.log 2>&1 &
    TEST_PID=$!
    
    echo "⏳ 等待后端服务启动..."
    sleep 5
    
    # 验证服务启动
    if ! kill -0 $AUTOGEN_PID 2>/dev/null; then
        echo "❌ AutoGen服务启动失败"
        cat logs/autogen-bedrock.log
        exit 1
    fi
    
    if ! kill -0 $TEST_PID 2>/dev/null; then
        echo "❌ 测试服务启动失败"
        cat logs/bedrock-test.log
        exit 1
    fi
    
    echo "✅ 后端服务启动成功"
}

# 创建简化的nginx配置
create_simple_nginx_config() {
    echo "📝 创建简化nginx配置..."
    
    cat > nginx-simple.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    server {
        listen 80;
        server_name _;
        
        # 静态文件服务
        location / {
            root /usr/share/nginx/html;
            index index.html index.htm;
            try_files $uri $uri/ =404;
        }
        
        # API代理到宿主机localhost
        location /api/ {
            proxy_pass http://localhost:8082;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # 健康检查代理
        location /health {
            proxy_pass http://localhost:8082/health;
            proxy_set_header Host $host;
        }
        
        # 测试API代理  
        location /bedrock-test/ {
            proxy_pass http://localhost:3002/;
            proxy_set_header Host $host;
        }
    }
}
EOF
    
    echo "✅ nginx配置创建完成"
}

# 启动nginx容器（使用宿主机网络）
start_nginx() {
    echo "🌐 启动nginx容器 (宿主机网络模式)..."
    
    # 创建简化配置
    create_simple_nginx_config
    
    # 使用宿主机网络启动nginx
    docker run -d \
        --name jstack-review-proxy \
        --network host \
        -v $(pwd):/usr/share/nginx/html:ro \
        -v $(pwd)/nginx-simple.conf:/etc/nginx/nginx.conf:ro \
        nginx:alpine
    
    echo "⏳ 等待nginx启动..."
    sleep 3
    
    echo "✅ nginx容器启动完成"
}

# 健康检查
health_check() {
    echo "🔍 执行全面健康检查..."
    
    local all_ok=true
    
    # 检查后端服务
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/health | grep -q "200"; then
        echo "✅ AutoGen服务 (8082) 正常"
    else
        echo "❌ AutoGen服务 (8082) 异常"
        all_ok=false
    fi
    
    if curl -s -o /dev/null http://localhost:3002/health 2>/dev/null; then
        echo "✅ 测试服务 (3002) 正常"
    else
        echo "❌ 测试服务 (3002) 异常"
        all_ok=false
    fi
    
    # 检查Web服务
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 | grep -q "200"; then
        echo "✅ Web服务 (8080) 正常"
    else
        echo "❌ Web服务 (8080) 异常"
        all_ok=false
    fi
    
    # 检查API代理
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health | grep -q "200"; then
        echo "✅ API代理正常"
    else
        echo "❌ API代理异常"
        echo "nginx日志:"
        docker logs jstack-review-proxy --tail 10
        all_ok=false
    fi
    
    if [ "$all_ok" = true ]; then
        echo ""
        echo "🎉 网络修复部署成功！"
        echo "=================================="
        echo "🌐 主应用: http://localhost:8080"
        echo "📱 AI分析器: http://localhost:8080/ai-simple.html"
        echo "🔧 传统分析器: http://localhost:8080/jstack-review-original/index.html"
        echo ""
        echo "🔗 直接API端点:"
        echo "   AutoGen API: http://localhost:8082"
        echo "   测试API: http://localhost:3002"
        echo ""
        echo "🛑 停止服务:"
        echo "   docker stop jstack-review-proxy && docker rm jstack-review-proxy"
        echo "   pkill -f autogen-bedrock-server && pkill -f bedrock-test-server"
    else
        echo ""
        echo "❌ 部分服务异常，请检查日志"
        echo "🔍 故障排除:"
        echo "   1. 后端日志: tail -f logs/*.log"
        echo "   2. nginx日志: docker logs jstack-review-proxy"
        echo "   3. 网络诊断: ./diagnose-network.sh"
        exit 1
    fi
}

# 主执行流程
main() {
    check_dependencies
    setup_config
    stop_old_services
    start_backend
    start_nginx
    health_check
}

# 错误处理
trap 'echo "🛑 部署被中断，清理资源..."; docker stop jstack-review-proxy 2>/dev/null || true; docker rm jstack-review-proxy 2>/dev/null || true; pkill -f autogen-bedrock-server 2>/dev/null || true; pkill -f bedrock-test-server 2>/dev/null || true; exit 1' INT TERM

# 执行主流程
main "$@"
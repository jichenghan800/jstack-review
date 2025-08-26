#!/bin/bash

echo "🔍 网络连接诊断工具 - 502 Bad Gateway问题"
echo "================================================"

# 检查后端服务状态
echo "📋 检查后端服务状态..."

if curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/health | grep -q "200"; then
    echo "✅ AutoGen服务在宿主机上运行正常 (8082)"
else
    echo "❌ AutoGen服务未运行或无法访问"
    echo "启动命令: nohup node autogen-bedrock-server.js > logs/autogen-bedrock.log 2>&1 &"
    exit 1
fi

if curl -s -o /dev/null http://localhost:3002/health 2>/dev/null; then
    echo "✅ Bedrock测试服务在宿主机上运行正常 (3002)"
else
    echo "❌ Bedrock测试服务未运行或无法访问"
fi

echo ""

# 检查nginx容器状态
echo "📋 检查nginx容器状态..."
if docker ps | grep -q "jstack-review-proxy"; then
    echo "✅ nginx容器正在运行"
    
    # 检查容器内部网络连接
    echo "🔗 测试容器内网络连接..."
    
    # 测试host.docker.internal
    if docker exec jstack-review-proxy nslookup host.docker.internal >/dev/null 2>&1; then
        echo "✅ host.docker.internal DNS解析正常"
    else
        echo "❌ host.docker.internal DNS解析失败"
    fi
    
    # 测试容器到宿主机的连接
    HOST_IP=$(docker exec jstack-review-proxy getent hosts host.docker.internal | awk '{ print $1 }' 2>/dev/null)
    if [ -n "$HOST_IP" ]; then
        echo "🌐 宿主机IP: $HOST_IP"
        
        # 测试端口连接
        if docker exec jstack-review-proxy nc -z $HOST_IP 8082 >/dev/null 2>&1; then
            echo "✅ 容器可以连接到宿主机8082端口"
        else
            echo "❌ 容器无法连接到宿主机8082端口"
        fi
        
        if docker exec jstack-review-proxy nc -z $HOST_IP 3002 >/dev/null 2>&1; then
            echo "✅ 容器可以连接到宿主机3002端口"
        else
            echo "❌ 容器无法连接到宿主机3002端口"
        fi
    else
        echo "❌ 无法获取宿主机IP地址"
    fi
    
else
    echo "❌ nginx容器未运行"
    exit 1
fi

echo ""

# 检查nginx配置
echo "📋 检查nginx配置..."
docker exec jstack-review-proxy cat /etc/nginx/conf.d/default.conf | head -20

echo ""

# 检查nginx错误日志
echo "📋 检查nginx错误日志..."
echo "最近的nginx错误："
docker logs jstack-review-proxy --tail 10 2>&1 | grep -i error || echo "无错误日志"

echo ""

# 提供修复建议
echo "🔧 修复建议..."

# 获取实际的宿主机IP
HOST_GATEWAY_IP=$(docker inspect jstack-review-proxy | grep -i gateway | head -1 | sed 's/.*"Gateway": "\([^"]*\)".*/\1/')

if [ -n "$HOST_GATEWAY_IP" ]; then
    echo "1. 尝试使用Docker网关IP: $HOST_GATEWAY_IP"
    echo "   修改nginx配置中的upstream地址"
fi

echo "2. 重新创建nginx容器使用网络模式："
echo "   docker stop jstack-review-proxy && docker rm jstack-review-proxy"
echo "   docker run -d --name jstack-review-proxy --network host -v \$(pwd):/usr/share/nginx/html:ro nginx:alpine"

echo "3. 或使用宿主机网络模式的部署脚本："
echo "   ./fix-network-deployment.sh"
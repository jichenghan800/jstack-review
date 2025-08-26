# JStack Review - AI Enhanced Java Thread Dump Analyzer
# 优化的Docker配置支持所有服务统一启动

FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apk add --no-cache \
    python3 \
    py3-pip \
    py3-requests \
    curl \
    bash \
    procps

# 复制package.json first for better caching
COPY package*.json ./

# 安装npm依赖
RUN npm install --only=production

# 复制项目文件
COPY . .

# 创建必要目录和设置权限
RUN mkdir -p logs config && \
    chmod 777 logs config

# 设置脚本权限
RUN chmod +x *.sh

# 暴露所有端口 (Web:8080, AutoGen:8082, Proxy:8081, Test:3002)
EXPOSE 8080 8082 8081 3002

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8080 || exit 1

# 使用简化启动脚本，避免代理服务问题
CMD ["./start-services-simple.sh"]

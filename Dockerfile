# JStack Review - AI Enhanced Java Thread Dump Analyzer
# Optimized Docker configuration with unified service startup

FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apk add --no-cache \
    python3 \
    py3-pip \
    curl \
    bash \
    procps

# 复制package.json first for better caching
COPY package*.json ./

# 安装npm依赖
RUN npm install --only=production

# 复制项目文件
COPY . .

# 创建日志目录
RUN mkdir -p logs

# 创建非root用户
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001 -G appuser

# 设置文件权限
RUN chown -R appuser:appuser /app && \
    chmod +x start-all-services.sh stop-all-services.sh

USER appuser

# 暴露端口 (Web: 8080, AutoGen: 8082, Test: 3002)
EXPOSE 8080 8082 3002

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# 使用统一启动脚本
CMD ["./start-all-services.sh"]

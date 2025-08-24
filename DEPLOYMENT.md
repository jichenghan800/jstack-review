# 部署指南

Java Thread Dump Analyzer - AI Enhanced 支持多种部署方式，适用于不同的使用场景。

## 🚀 一键部署 (推荐)

### Ubuntu 完整部署

```bash
# 下载并运行完整部署脚本
curl -fsSL https://raw.githubusercontent.com/jichenghan800/jstack-review/gh-pages/deploy.sh | bash
```

### 快速部署

```bash
# 下载并运行快速部署脚本
curl -fsSL https://raw.githubusercontent.com/jichenghan800/jstack-review/gh-pages/quick-deploy.sh | bash
```

## 📋 手动部署

### 1. 系统要求

- **操作系统**: Ubuntu 18.04+ (推荐 20.04/22.04)
- **Node.js**: 16.0+ 
- **Python**: 3.6+
- **内存**: 最小 1GB，推荐 2GB+
- **磁盘**: 最小 500MB

### 2. 安装依赖

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装基础依赖
sudo apt install -y curl wget git nodejs npm python3 python3-pip

# 安装AWS CLI (可选，用于Bedrock测试)
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### 3. 克隆项目

```bash
# 克隆项目
git clone -b gh-pages https://github.com/jichenghan800/jstack-review.git
cd jstack-review

# 安装npm依赖
npm install
```

### 4. 启动服务

```bash
# 方式1: 仅Web服务
./start-server.sh

# 方式2: 完整服务 (Web + Bedrock测试)
./start-all.sh

# 方式3: 自定义端口
./start-server.sh 9000
```

## 🐳 Docker 部署

### 使用 Docker

```bash
# 克隆项目
git clone -b gh-pages https://github.com/jichenghan800/jstack-review.git
cd jstack-review

# 构建镜像
docker build -t jstack-analyzer .

# 运行容器
docker run -d \
  --name jstack-analyzer \
  -p 8080:8080 \
  -p 3002:3002 \
  jstack-analyzer
```

### 使用 Docker Compose

```bash
# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## ☁️ 云服务部署

### AWS EC2

1. **创建EC2实例**
   - 选择Ubuntu 20.04 LTS
   - 实例类型: t3.small 或更高
   - 安全组开放端口: 22, 80, 8080, 3002

2. **连接并部署**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   curl -fsSL https://raw.githubusercontent.com/jichenghan800/jstack-review/gh-pages/deploy.sh | bash
   ```

## 🔧 配置说明

### 环境变量

```bash
# Web服务端口 (默认: 8080)
export WEB_PORT=8080

# Bedrock测试服务端口 (默认: 3002)
export BEDROCK_PORT=3002
```

### 防火墙配置

```bash
# UFW防火墙
sudo ufw allow 8080/tcp
sudo ufw allow 3002/tcp
sudo ufw enable
```

## 🌐 访问地址

部署完成后，可通过以下地址访问：

- **主页**: http://your-server-ip:8080/
- **AI分析器**: http://your-server-ip:8080/ai-simple.html
- **传统分析器**: http://your-server-ip:8080/test.html

## 🔑 AI配置

### OpenAI配置

1. 获取API Key: https://platform.openai.com
2. 在AI配置页面填写API Key
3. 选择模型 (推荐GPT-4o)
4. 测试连接

### AWS Bedrock配置

1. 创建IAM用户并获取访问密钥
2. 附加权限: `AmazonBedrockFullAccess`
3. 在AI配置页面填写AWS凭证
4. 选择区域和模型
5. 测试连接

## 🛠️ 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 查看端口占用
   sudo netstat -tlnp | grep :8080
   
   # 杀死进程
   sudo kill -9 <PID>
   ```

2. **权限问题**
   ```bash
   # 设置文件权限
   chmod +x *.sh
   ```

### 日志查看

```bash
# 查看服务日志
tail -f ~/jstack-review/server.log

# 查看Bedrock服务日志
tail -f ~/jstack-review/bedrock-service.log
```

## 🔄 更新

```bash
# 更新项目
cd ~/jstack-review
git pull origin gh-pages
npm install

# 重启服务
./start-all.sh
```

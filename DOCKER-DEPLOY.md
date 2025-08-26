# JStack Review - Docker一键部署

## 🐳 快速部署

在任何安装了Docker的服务器上执行以下命令即可完成一键部署：

### 方式一：完整部署（推荐）
```bash
curl -fsSL https://raw.githubusercontent.com/jichenghan800/jstack-review/gh-pages/docker-one-click-deploy.sh | sudo bash
```

### 方式二：快速部署
```bash
curl -fsSL https://raw.githubusercontent.com/jichenghan800/jstack-review/gh-pages/docker-quick-deploy.sh | bash
```

## 📋 部署内容

部署完成后将启动以下服务：
- **Web服务器** (8080): 静态文件服务和主页
- **AutoGen API** (8082): AWS Bedrock AI模型调用
- **API代理服务器** (8081): 解决云服务器网络访问问题  
- **测试API** (3002): Bedrock连接测试服务

## 🌐 访问地址

部署成功后可通过以下地址访问：
- 🤖 **AI分析器**: http://YOUR_SERVER_IP:8080/ai-simple.html
- 🔧 **传统分析器**: http://YOUR_SERVER_IP:8080/test.html
- 📊 **API健康检查**: http://YOUR_SERVER_IP:8082/health

## 🐳 Docker管理命令

```bash
# 进入项目目录
cd /opt/jstack-review

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 完全清理
docker-compose down -v --rmi all
```

## ⚙️ 端口配置

可通过环境变量自定义端口：
```bash
export WEB_PORT=8080
export API_PORT=8082  
export PROXY_PORT=8081
export TEST_PORT=3002
```

## 🔑 AI服务配置

部署完成后需要配置AI服务：
- **OpenAI**: 需要API Key
- **AWS Bedrock**: 需要配置AWS访问凭证

## 🚀 系统要求

- Docker 20.10+ 
- Docker Compose v2
- 2GB+ 可用内存
- 5GB+ 可用磁盘空间

## 🔧 故障排除

1. **端口冲突**: 修改.env文件中的端口配置
2. **服务无法启动**: 检查`docker-compose logs`
3. **网络问题**: 确认防火墙设置允许相关端口访问
4. **权限问题**: 确保以root权限运行部署脚本
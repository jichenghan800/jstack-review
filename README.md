# Java Thread Dump Analyzer - AI Enhanced

[![jstack.review][logo]](https://jstack.review)

**[🚀 在线体验 AI 分析功能](https://jichenghan800.github.io/jstack-review/ai-simple.html)**

这是一个AI增强的Java线程转储分析器，基于原始的[jstack.review](https://jstack.review)项目，集成了OpenAI GPT和AWS Bedrock等先进的AI模型，提供智能的线程分析和性能诊断。

## ✨ 主要特性

### 🤖 AI 智能分析
- **多AI模型支持**: OpenAI GPT-5/4o/4, AWS Bedrock Claude 4.0 Sonnet等
- **智能健康评分**: AI自动评估系统健康状况(0-100分)
- **完整线程分析**: 包括运行中、等待中、阻塞、休眠、非Java线程统计
- **问题自动检测**: 识别死锁、性能瓶颈、资源竞争等问题
- **优化建议**: 提供具体的性能优化和问题解决方案

### 🔧 双AI提供商支持
- **OpenAI**: 支持GPT-5, GPT-4o, GPT-4, GPT-3.5系列
- **AWS Bedrock**: 支持Claude, Titan, Llama, Mistral等模型
- **智能分段处理**: 自动处理大文件，避免数据截断丢失
- **容量感知分析**: 充分利用Claude Sonnet 4的1M token窗口

### 📊 专业分析功能
- **线程状态统计**: 详细的线程状态分布和分析
- **性能瓶颈识别**: 自动识别系统性能问题
- **风险评估**: 全面的系统风险分析
- **可视化报告**: 直观的图表和数据展示

## 🐳 Docker 一键部署（推荐）

### 方式一：快速部署脚本

```bash
# 克隆项目
git clone https://github.com/jichenghan800/jstack-review.git
cd jstack-review

# 一键启动（包含所有服务）
chmod +x docker-one-click-deploy.sh
./docker-one-click-deploy.sh

# 或者快速部署（仅Web服务）
chmod +x docker-quick-deploy.sh
./docker-quick-deploy.sh
```

### 方式二：Docker Compose

```bash
# 标准部署 - 推荐生产环境
docker-compose up -d

# 带Nginx反向代理部署 - 推荐公网访问
docker-compose --profile with-nginx up -d

# 开发模式部署 - 支持热重载
docker-compose --profile development up -d
```

### 方式三：自定义配置

```bash
# 1. 复制配置文件
cp config.example.json config.json

# 2. 编辑配置（可选）
nano config.json

# 3. 启动容器
docker-compose up -d
```

### 🔍 部署验证

```bash
# 检查容器状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 健康检查
curl http://localhost:8080/health
curl http://localhost:8082/health

# 访问应用
open http://localhost:8080
```

### 📋 Docker服务说明

| 服务 | 端口 | 说明 | 健康检查 |
|-----|------|------|----------|
| **Web服务器** | 8080 | 主要的Web应用和静态文件服务 | ✅ HTTP检查 |
| **AutoGen API** | 8082 | AWS Bedrock集成API服务 | ✅ 健康端点 |
| **API代理** | 8081 | 外部访问代理（可选） | ✅ 反向代理检查 |
| **测试服务** | 3002 | Bedrock连接测试和验证 | ✅ 连通性检查 |

### 🛠️ Docker管理命令

```bash
# 查看运行状态
docker-compose ps
docker-compose top

# 实时日志监控
docker-compose logs -f
docker-compose logs -f web-server

# 重启特定服务
docker-compose restart web-server
docker-compose restart autogen-api

# 更新服务
git pull
docker-compose pull
docker-compose up -d

# 完全清理
docker-compose down -v
docker system prune -a
```

### 🔧 Docker配置选项

#### 环境变量配置
```bash
# 创建环境文件
cat > .env << EOF
# AWS配置（可选）
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-west-2

# 服务端口（可选，使用默认值）
WEB_PORT=8080
API_PORT=8082
PROXY_PORT=8081
TEST_PORT=3002

# 日志级别
LOG_LEVEL=info
DEBUG=false
EOF
```

#### 持久化存储配置
```yaml
# docker-compose.override.yml
version: '3.8'
services:
  web-server:
    volumes:
      - ./custom-config:/app/config
      - ./logs:/app/logs
      - ./uploads:/app/uploads
```

## 🚀 其他部署方式

### 本地开发部署

```bash
# 1. 克隆项目
git clone https://github.com/jichenghan800/jstack-review.git
cd jstack-review

# 2. 安装依赖
npm install

# 3. 配置环境变量（可选）
cp .env.example .env
nano .env

# 4. 启动所有服务
./start-all-services.sh
```

### 云平台部署

#### AWS ECS部署
```bash
# 1. 构建并推送镜像
docker build -t your-registry/jstack-review .
docker push your-registry/jstack-review

# 2. 使用ECS服务定义部署
# （详见DOCKER-DEPLOY.md文档）
```

#### 阿里云容器服务
```bash
# 1. 登录阿里云镜像仓库
docker login --username=your_username registry.cn-hangzhou.aliyuncs.com

# 2. 推送镜像
docker tag jstack-review registry.cn-hangzhou.aliyuncs.com/your-namespace/jstack-review
docker push registry.cn-hangzhou.aliyuncs.com/your-namespace/jstack-review
```

## 🔐 安全配置

### AWS凭证配置（重要！）

**⚠️ 安全提醒：永远不要在代码中硬编码AWS凭证！**

#### 方法1：Docker环境变量（推荐）
```bash
# 在.env文件中配置
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-west-2
```

#### 方法2：Docker Secrets（生产环境）
```yaml
# docker-compose.yml
secrets:
  aws_access_key:
    file: ./secrets/aws_access_key.txt
  aws_secret_key:
    file: ./secrets/aws_secret_key.txt

services:
  autogen-api:
    secrets:
      - aws_access_key
      - aws_secret_key
```

#### 方法3：浏览器配置
在应用的"AI配置"页面中输入您的AWS凭证（仅本地存储）

### 🛡️ 安全最佳实践
- ✅ 使用Docker Secrets管理敏感信息
- ✅ 定期轮换访问密钥
- ✅ 使用最小权限原则
- ✅ 启用容器安全扫描
- ❌ 永远不要提交凭证到版本控制

## 🎯 使用方法

### 访问应用
- **AI增强版本**: http://localhost:8080/ai-simple.html
- **传统版本**: http://localhost:8080/test.html
- **主页**: http://localhost:8080

### 基础使用流程
1. **访问应用**: Docker部署后直接访问 http://localhost:8080
2. **配置AI服务**: 点击"AI配置"按钮设置API密钥
3. **选择AI提供商**: OpenAI 或 AWS Bedrock
4. **测试连接**: 验证API配置是否正确
5. **上传线程转储**: 支持文件上传或拖拽操作
6. **开始AI分析**: 系统自动调用AI进行智能分段分析
7. **查看完整结果**: 获得健康评分、完整统计、问题诊断、优化建议

### AI模型选择指南
- **Claude 4.0 Sonnet**: AWS Bedrock，专业代码分析，推荐
- **OpenAI GPT-4o**: 最新模型，平衡性能和成本
- **GPT-4**: 深度分析，适合复杂问题
- **GPT-3.5 Turbo**: 快速分析，适合简单诊断

## 🔧 故障排除

### Docker相关问题

#### 问题1: "端口被占用"
```bash
# 检查端口占用
sudo netstat -tlnp | grep :8080
sudo lsof -i :8080

# 停止冲突服务
docker-compose down
sudo systemctl stop nginx  # 如果占用80端口
```

#### 问题2: "容器无法启动"
```bash
# 查看详细日志
docker-compose logs -f
docker-compose logs web-server

# 重新构建镜像
docker-compose build --no-cache
docker-compose up -d

# 检查资源使用
docker stats
docker system df
```

#### 问题3: "健康检查失败"
```bash
# 手动测试健康检查
curl -f http://localhost:8080/health
curl -f http://localhost:8082/health

# 进入容器调试
docker-compose exec web-server bash
docker-compose exec autogen-api sh

# 查看容器内部日志
docker-compose exec web-server tail -f /var/log/app.log
```

### 配置相关问题

#### 问题1: "AWS凭证配置错误"
```bash
# 验证环境变量
docker-compose exec autogen-api env | grep AWS

# 测试AWS连接
docker-compose exec autogen-api curl localhost:3002/health
```

#### 问题2: "AI模型访问被拒绝"
```bash
# 检查Bedrock模型访问权限
# 1. 登录AWS控制台
# 2. 进入Bedrock服务
# 3. 点击"Model access"
# 4. 启用Claude 4.0 Sonnet模型
```

### 性能优化

#### 大文件处理优化
- Docker部署自动支持大文件智能分段处理
- 容器内存建议：2GB+
- 对于超大文件（>10MB），建议增加容器资源限制

#### 容器资源配置
```yaml
# docker-compose.yml
services:
  web-server:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
  
  autogen-api:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1.0'
```

## 📈 版本历史

### v2.2.0 (2025-01-26)
- 🐳 **Docker一键部署**: 新增完整的Docker部署方案和脚本
- 🎯 **AI分析完整性修复**: 移除40KB截断限制，支持大文件完整处理
- 📊 **线程统计完善**: 添加休眠线程和非Java线程统计显示
- 🎨 **UI界面优化**: 修复统计卡片图标显示问题
- 🔧 **容量感知升级**: 智能利用Claude Sonnet 4的1M token窗口

### v2.1.0 (2025-01-24)
- 🔐 **安全增强**: 完善的安全配置和凭证管理
- 🚀 **统一启动**: 新增 `start-all-services.sh` 和 `stop-all-services.sh`
- 🐳 **Docker优化**: 改进Docker配置，支持健康检查
- 📚 **文档完善**: 全面的故障排除指南和使用说明

## 🔒 隐私安全

- **容器化隔离**: Docker容器提供安全的运行环境
- **本地处理**: 线程转储文件在容器内本地处理，不上传到外部服务器
- **API安全**: 仅调用AI API进行分析，不存储敏感数据
- **配置保护**: API密钥可选择环境变量或浏览器本地存储

## 🛠️ 技术栈

- **容器化**: Docker & Docker Compose
- **前端**: HTML5, Bootstrap 5, JavaScript
- **AI集成**: OpenAI API, AWS Bedrock
- **后端**: Node.js, Express.js
- **部署**: 支持云平台和本地部署

## 🤝 贡献

欢迎提交Issue和Pull Request！请参考 [开发指南](DOCKER-DEPLOY.md) 了解详细的开发和部署流程。

## 📄 许可证

本项目基于Apache License 2.0许可证。

## 🔗 相关链接

- [原始项目](https://github.com/spotify/threaddump-analyzer)
- [jstack.review](https://jstack.review)
- [OpenAI Platform](https://platform.openai.com)
- [AWS Bedrock](https://aws.amazon.com/bedrock/)
- [Docker Hub](https://hub.docker.com)

[logo]: https://jstack.review/logo.svg
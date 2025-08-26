# Java Thread Dump Analyzer - AI Enhanced

<div align="center">
  <a href="https://jstack.review">
    <img src="logo.svg" alt="jstack.review" width="200"/>
  </a>
</div>

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

## 🚀 快速部署

### 完整代理服务部署（推荐生产环境）

```bash
# 1. 克隆项目
git clone https://github.com/jichenghan800/jstack-review.git
cd jstack-review

# 2. 一键部署完整代理服务
chmod +x docker-proxy-deploy.sh
./docker-proxy-deploy.sh
```

**服务访问地址：**
- 🌐 主应用: `http://localhost:8080`
- 📱 AI增强分析器: `http://localhost:8080/ai-simple.html`
- 🔧 传统分析器: `http://localhost:8080/jstack-review-original/index.html`

### Docker Compose 部署

```bash
# 标准部署
docker-compose up -d

# 带 nginx 反向代理
docker-compose --profile with-nginx up -d

# 查看服务状态
docker-compose ps
```

### 超简单部署（仅静态文件）

```bash
# 最简单的部署方式
chmod +x docker-super-simple.sh
./docker-super-simple.sh
```

## 🔧 本地开发

### 方式一：脚本启动（推荐）

```bash
# 安装依赖
npm install

# 启动所有服务
chmod +x start-services-simple.sh
./start-services-simple.sh

# 停止所有服务
./stop-all-services.sh
```

### 方式二：手动启动

```bash
# 1. 启动 Web 服务器 (端口 8080)
python3 -m http.server 8080

# 2. 启动 AutoGen Bedrock 服务 (端口 8082)
node autogen-bedrock-server.js

# 3. 启动 Bedrock 测试服务 (端口 3002)
node bedrock-test-server.js
```

## 🏗️ 系统架构

### 服务端口分布
- **8080**: Web服务器 + API代理
- **8082**: AutoGen Bedrock API服务
- **3002**: Bedrock测试服务
- **8081**: API代理服务（已整合到8080）

### 代理服务架构
```
用户请求 → nginx:8080 → 静态文件/API代理
                    ├─ /api/* → AutoGen服务:8082
                    ├─ /health → 健康检查:8082
                    └─ /bedrock-test/* → 测试API:3002
```

### 关键组件

1. **前端应用**
   - `ai-simple.html`: AI增强分析器
   - `jstack-review-original/index.html`: 传统分析器
   - 客户端处理，数据不上传服务器

2. **后端服务**
   - `autogen-bedrock-server.js`: AWS Bedrock集成
   - `bedrock-test-server.js`: 凭证测试服务
   - `nginx-proxy.conf`: API代理配置

3. **核心分析**
   - `jtdajs.js`: 原始分析逻辑
   - `jtdajs.ai.js`: AI增强分析
   - 支持智能分段和容量感知处理

## ⚙️ 配置说明

### AWS 凭证配置

在浏览器中访问应用，点击右上角"AI配置"按钮：

```javascript
{
  "accessKey": "your_aws_access_key",
  "secretKey": "your_aws_secret_key", 
  "region": "us-west-2",
  "modelId": "anthropic.claude-3-sonnet-20240229-v1:0"
}
```

### OpenAI 配置

```javascript
{
  "apiKey": "your_openai_api_key",
  "model": "gpt-4o",
  "baseURL": "https://api.openai.com/v1" // 可选
}
```

### 环境变量（可选）

```bash
# 复制模板
cp .env.example .env

# 编辑环境变量
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=us-west-2
```

## 📝 使用指南

### 基本使用流程

1. **启动服务**: 使用任一部署方式启动服务
2. **访问应用**: 打开 `http://localhost:8080/ai-simple.html`
3. **配置AI**: 点击右上角配置AWS或OpenAI凭证
4. **上传文件**: 拖拽或选择thread dump文件
5. **查看分析**: AI自动分析并生成报告

### 支持的文件格式

- `.txt`: 标准thread dump文件
- `.log`: 日志格式thread dump
- `.dump`: JVM dump文件
- 直接粘贴文本内容

### AI分析功能

- **健康评分**: 0-100分系统健康评估
- **问题检测**: 自动识别死锁、性能问题
- **优化建议**: 具体的改进方案
- **线程统计**: 完整的线程状态分布

## 🔍 故障排除

### 常见问题

**1. AI分析失败 - ERR_CONNECTION_REFUSED**
```bash
# 确保所有服务正在运行
curl http://localhost:8080/health
curl http://localhost:8082/health
curl http://localhost:3002/health
```

**2. Docker容器启动失败**
```bash
# 查看容器日志
docker logs jstack-review-proxy
docker logs jstack-review-app

# 重新部署
./docker-proxy-deploy.sh
```

**3. API代理不工作**
```bash
# 测试代理端点
curl http://localhost:8080/api/invoke-autogen-bedrock
curl http://localhost:8080/bedrock-test/health
```

### 服务健康检查

```bash
# 检查所有服务状态
curl -s http://localhost:8080/health | jq .
curl -s http://localhost:8082/health | jq .
curl -s http://localhost:3002/health | jq .

# 检查端口占用
lsof -i :8080
lsof -i :8082
lsof -i :3002
```

### 日志查看

```bash
# 查看服务日志
tail -f logs/web-server.log
tail -f logs/autogen-bedrock.log
tail -f logs/bedrock-test.log

# 查看Docker日志
docker logs -f jstack-review-proxy
```

## 🤝 贡献指南

### 开发环境设置

```bash
git clone https://github.com/jichenghan800/jstack-review.git
cd jstack-review

# 安装依赖
npm install

# 启动开发环境
npm run dev

# 运行测试
npm test
```

### 代码提交规范

```bash
# 功能提交
git commit -m "✨ 添加新功能: 描述"

# 修复提交  
git commit -m "🐛 修复问题: 描述"

# 文档更新
git commit -m "📚 更新文档: 描述"
```

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源协议发布。

## 🔗 相关链接

- **原项目**: [jstack.review](https://jstack.review)
- **GitHub**: [jstack-review](https://github.com/jichenghan800/jstack-review)
- **在线演示**: [AI增强分析器](https://jichenghan800.github.io/jstack-review/ai-simple.html)

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=jichenghan800/jstack-review&type=Date)](https://star-history.com/#jichenghan800/jstack-review&Date)

---

**💡 提示**: 配置AWS凭证后即可使用完整的AI分析功能！
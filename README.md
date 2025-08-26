# Java Thread Dump Analyzer - AI Enhanced

<div align="center">
  <a href="https://jstack.review">
    <img src="logo.svg" alt="jstack.review" width="200"/>
  </a>
</div>

**[🚀 在线体验 AI 分析功能](https://jichenghan800.github.io/jstack-review/ai-simple.html)**

这是一个AI增强的Java线程转储分析器，基于原始的[jstack.review](https://jstack.review)项目，集成了AWS Bedrock等先进的AI模型，提供智能的线程分析和性能诊断。

## ✨ 主要特性

### 🤖 AI 智能分析
- **AWS Bedrock集成**: Claude 4.0 Sonnet等先进AI模型
- **智能健康评分**: AI自动评估系统健康状况(0-100分)
- **完整线程分析**: 包括运行中、等待中、阻塞、休眠、非Java线程统计
- **问题自动检测**: 识别死锁、性能瓶颈、资源竞争等问题
- **优化建议**: 提供具体的性能优化和问题解决方案

### 🔧 AI模型支持
- **AWS Bedrock**: Claude, Titan, Llama, Mistral等模型
- **智能分段处理**: 自动处理大文件，避免数据截断丢失
- **容量感知分析**: 充分利用Claude Sonnet 4的实际token限制

### 📊 专业分析功能
- **线程状态统计**: 详细的线程状态分布和分析
- **性能瓶颈识别**: 自动识别系统性能问题
- **风险评估**: 全面的系统风险分析
- **可视化报告**: 直观的图表和数据展示

## 🚀 部署方式

### NPM单端口部署 ⭐（推荐）

**优势**: 简单安全，单端口对外，避免防火墙配置
```bash
# 克隆项目
git clone https://github.com/jichenghan800/jstack-review.git
cd jstack-review

# 安装依赖
npm install

# 方法1: 使用NPM脚本启动（推荐）
npm run single-port

# 方法2: 直接运行脚本
./start-single-port.sh

# 停止服务
npm run stop
# 或
./stop-single-port.sh

# 检查服务状态
npm run health
# 或
./health-check.sh

# 访问应用
# AI增强分析器: http://localhost:8080/ai-simple.html
```

**架构说明**:
- 对外端口：8080（统一HTTP服务器 + API代理）
- 内部端口：8082（AutoGen API服务器，不对外暴露）
- 安全性：只需开放一个端口，内部服务完全隔离

## 🔧 本地开发

### 方式一：脚本启动（推荐）

```bash
# 安装依赖
npm install

# 启动所有服务
chmod +x start-services-simple.sh
./start-services-simple.sh

# 停止所有服务
chmod +x stop-all-services.sh
./stop-all-services.sh

# 访问应用
# AI增强分析器: http://localhost:8080/ai-simple.html
# API健康检查: http://localhost:8082/health
```

### 方式二：手动启动

```bash
# 启动AutoGen Bedrock服务器
node autogen-bedrock-server.js &

# 启动Web服务器
python3 -m http.server 8080 &

# 或使用npm脚本
npm run autogen &
npm run web &
```

## 🏗️ 系统架构

### 服务端口分布
- **8080**: 前端Web服务器 (静态文件)
- **8082**: AutoGen Bedrock API服务器 (AI分析后端)
- **3002**: Bedrock测试服务器 (凭证验证)

### 代理服务架构
- **统一HTTP服务器**: Python代理服务器，处理静态文件和API转发
- **AutoGen API**: Node.js服务器，处理AWS Bedrock AI调用
- **前端应用**: 纯JavaScript应用，支持多种AI模型

### 关键组件

1. **前端分析引擎** (`jtdajs.js`, `jtdajs.ai.js`)
   - 线程转储解析
   - AI增强分析
   - 数据可视化

2. **后端API服务** (`autogen-bedrock-server.js`)
   - AWS Bedrock集成
   - 多用户并发支持
   - 模型调用管理

3. **统一代理服务** (`unified-server.py`)
   - 单端口架构
   - 静态文件服务
   - API请求代理

## ⚙️ 配置说明

### AWS 凭证配置

在AI分析界面点击"AI配置"按钮，填入：
- **Access Key ID**: 您的AWS访问密钥
- **Secret Access Key**: 您的AWS秘密密钥
- **Region**: 建议使用 `us-west-2`
- **模型**: 选择 Claude 4.0 Sonnet

或通过环境变量配置：
```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=us-west-2
```

### 环境变量（可选）

创建 `.env` 文件：
```bash
# AWS Bedrock配置
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-west-2

# 服务端口配置
WEB_PORT=8080
AUTOGEN_PORT=8082
```

## 📝 使用指南

### 基本使用流程

1. **启动服务**: `npm run single-port`
2. **访问应用**: http://localhost:8080/ai-simple.html
3. **配置AI**: 点击"AI配置"设置AWS Bedrock凭证
4. **上传文件**: 支持线程转储文件或使用演示数据
5. **查看分析**: 获得AI增强的分析报告和优化建议

### 支持的文件格式
- Java线程转储文件 (`.txt`, `.log`, `.dump`)
- JStack输出文件
- 各种格式的堆栈跟踪文件

### AI分析功能
- **健康评分**: 0-10分的系统健康评估
- **问题识别**: 自动检测死锁、阻塞、性能问题
- **优化建议**: 具体的代码和配置优化方案
- **风险预警**: 潜在问题的早期预警

## 🔍 故障排除

### 常见问题

**问题1: 服务启动失败**
```bash
# 检查端口占用
lsof -i :8080
lsof -i :8082

# 停止占用进程
kill -9 <PID>

# 重新启动
npm run single-port
```

**问题2: AI分析失败**
```bash
# 检查AWS凭证
npm run health

# 查看日志
tail -f logs/autogen-bedrock.log
tail -f logs/unified-server.log
```

**问题3: 文件上传失败**
- 检查文件大小（建议<10MB）
- 确认文件格式为文本格式
- 尝试使用演示数据验证功能

### 服务健康检查

```bash
# 检查所有服务状态
npm run health

# 手动检查
curl http://localhost:8080        # 前端服务
curl http://localhost:8082/health # 后端API
curl http://localhost:8080/api/default-config # API代理
```

### 日志查看

```bash
# 查看统一服务器日志
tail -f logs/unified-server.log

# 查看AutoGen API日志
tail -f logs/autogen-bedrock.log

# 查看所有日志
tail -f logs/*.log
```

## 🤝 贡献指南

### 开发环境设置

```bash
# 1. Fork项目并克隆
git clone https://github.com/your-username/jstack-review.git
cd jstack-review

# 2. 安装依赖
npm install

# 3. 启动开发环境
npm run single-port

# 4. 开始开发
# 前端文件: ai-simple.html, jtdajs.js, jtdajs.ai.js
# 后端文件: autogen-bedrock-server.js, unified-server.py
```

### 代码提交规范

使用语义化提交信息：
```bash
feat: 新增功能
fix: 修复bug
docs: 文档更新
style: 代码格式
refactor: 代码重构
test: 测试相关
chore: 构建或辅助工具
```

## 📄 许可证

本项目采用 [Apache 2.0](LICENSE) 许可证。

## 🔗 相关链接

- **在线演示**: https://jichenghan800.github.io/jstack-review/ai-simple.html
- **原始项目**: https://jstack.review
- **GitHub**: https://github.com/jichenghan800/jstack-review

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=jichenghan800/jstack-review&type=Date)](https://star-history.com/#jichenghan800/jstack-review&Date)
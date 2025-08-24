# Java Thread Dump Analyzer - AI Enhanced

[![jstack.review][logo]](https://jstack.review)

**[🚀 在线体验 AI 分析功能](https://jichenghan800.github.io/jstack-review/ai-simple.html)**

这是一个AI增强的Java线程转储分析器，基于原始的[jstack.review](https://jstack.review)项目，集成了OpenAI GPT和AWS Bedrock等先进的AI模型，提供智能的线程分析和性能诊断。

## ✨ 主要特性

### 🤖 AI 智能分析
- **多AI模型支持**: OpenAI GPT-5/4o/4, AWS Bedrock Claude 3.5等
- **智能健康评分**: AI自动评估系统健康状况(0-100分)
- **问题自动检测**: 识别死锁、性能瓶颈、资源竞争等问题
- **优化建议**: 提供具体的性能优化和问题解决方案

### 🔧 双提供商支持
- **OpenAI**: 支持GPT-5, GPT-4o, GPT-4, GPT-3.5系列
- **AWS Bedrock**: 支持Claude, Titan, Llama, Mistral等模型
- **一键切换**: 在同一界面中自由切换AI提供商
- **真实连接测试**: 验证API配置和模型可用性

### 📊 专业分析功能
- **线程状态统计**: 详细的线程状态分布和分析
- **性能瓶颈识别**: 自动识别系统性能问题
- **风险评估**: 全面的系统风险分析
- **可视化报告**: 直观的图表和数据展示

## 🚀 快速开始

### 在线使用
直接访问：[https://jichenghan800.github.io/jstack-review/ai-simple.html](https://jichenghan800.github.io/jstack-review/ai-simple.html)

### 本地部署

#### 方式一：统一服务启动（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/jichenghan800/jstack-review.git
cd jstack-review

# 2. 安装依赖
npm install

# 3. 配置环境变量（可选）
cp .env.example .env
# 编辑 .env 文件填入 AWS 凭证

# 4. 启动所有服务
./start-all-services.sh
```

**服务说明：**
- 🌐 **Web服务器** (端口 8080): 主要的Web应用
- 🤖 **AutoGen服务** (端口 8082): AWS Bedrock集成API
- 🧪 **测试服务** (端口 3002): Bedrock连接测试

#### 方式二：Docker部署

```bash
# 标准部署
docker-compose up -d

# 带Nginx反向代理
docker-compose --profile with-nginx up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

#### 方式三：手动启动

```bash
# 启动基础HTTP服务
python3 -m http.server 8080

# 启动完整服务（另开终端）
npm start
```

### 访问应用
- **AI增强版本**: http://localhost:8080/ai-simple.html
- **传统版本**: http://localhost:8080/test.html
- **AI配置页面**: http://localhost:8080/ai-config.html

## 🔐 安全配置

### AWS凭证配置（重要！）

**⚠️ 安全提醒：永远不要在代码中硬编码AWS凭证！**

#### 方法1：环境变量（推荐）
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑.env文件，填入您的实际凭证
nano .env
```

#### 方法2：AWS CLI配置
```bash
aws configure
```

#### 方法3：浏览器配置
在应用的"AI配置"页面中输入您的AWS凭证

### 🛡️ 安全最佳实践
- ✅ 使用`.env`文件存储敏感信息
- ✅ 确保`.env`文件在`.gitignore`中
- ✅ 定期轮换访问密钥
- ✅ 使用最小权限原则
- ❌ 永远不要提交凭证到版本控制

## 🔑 AI 配置

### OpenAI 配置
1. 获取API Key: [OpenAI Platform](https://platform.openai.com)
2. 在AI配置中填写API Key
3. 选择模型(推荐GPT-4o)
4. 测试连接

### AWS Bedrock 配置
1. 创建IAM用户并获取访问密钥
2. 附加权限: `AmazonBedrockFullAccess`
3. 在AI配置中填写AWS凭证
4. 选择区域和模型
5. 测试连接

## 📁 项目结构

```
jstack-review/
├── 🌐 前端文件
│   ├── index.html              # 主页面
│   ├── ai-simple.html          # AI增强分析器（主要功能）
│   ├── test.html               # 传统分析器
│   └── ai-config.html          # AI配置页面
│
├── 🤖 后端服务
│   ├── autogen-bedrock-server.js  # AutoGen Bedrock集成服务 (8082端口)
│   ├── bedrock-test-server.js     # Bedrock测试服务 (3002端口)
│   └── bedrock-server.js          # Bedrock API服务器
│
├── 🔧 核心逻辑
│   ├── jtdajs.js               # 原始线程分析逻辑
│   ├── jtdajs.ai.js            # AI增强分析逻辑
│   ├── jtdajs.render.js        # 结果渲染逻辑
│   └── aws-config.js           # AWS配置管理
│
├── 🚀 部署脚本
│   ├── start-all-services.sh   # 统一启动脚本
│   ├── stop-all-services.sh    # 统一停止脚本
│   ├── docker-compose.yml      # Docker部署配置
│   └── Dockerfile              # Docker镜像配置
│
├── 📋 配置文件
│   ├── package.json            # Node.js项目配置
│   ├── .env.example            # 环境变量模板
│   ├── .gitignore              # Git忽略文件
│   └── CLAUDE.md               # 开发指南
│
└── 📖 文档
    ├── README.md               # 项目说明（本文件）
    ├── CHANGELOG.md            # 版本更新日志
    └── bedrock-dynamic-models.md  # Bedrock模型配置说明
```

### 核心文件说明
- **ai-simple.html**: 主要的AI分析界面，支持OpenAI和AWS Bedrock
- **autogen-bedrock-server.js**: 处理AWS Bedrock API调用的后端服务
- **jtdajs.ai.js**: 集成AI分析功能的核心逻辑
- **start-all-services.sh**: 一键启动所有必要服务的脚本

## 🎯 使用方法

### 基础使用流程
1. **访问应用**: 打开 `ai-simple.html` 页面
2. **配置AI服务**: 点击"AI配置"按钮设置API密钥
3. **选择AI提供商**: OpenAI 或 AWS Bedrock
4. **测试连接**: 验证API配置是否正确
5. **上传线程转储**: 支持文件上传或拖拽操作
6. **开始AI分析**: 系统自动调用AI进行分析
7. **查看结果**: 获得健康评分、问题诊断、优化建议

### AI模型选择指南
- **OpenAI GPT-4o**: 最新模型，平衡性能和成本
- **Claude 4.0 Sonnet**: AWS Bedrock，专业代码分析
- **GPT-4**: 深度分析，适合复杂问题
- **GPT-3.5 Turbo**: 快速分析，适合简单诊断

### 分析报告解读
- **健康评分 (0-100分)**: 系统整体健康状况评估
- **线程状态分布**: RUNNABLE、BLOCKED、WAITING等状态统计  
- **问题检测**: 死锁、性能瓶颈、资源竞争识别
- **技术栈识别**: Spring、Tomcat等框架自动识别
- **优化建议**: 具体的性能调优和问题解决方案

## 🐛 常见问题与故障排除

### AWS Bedrock 配置问题

#### 问题1: "AWS Access Key ID格式不正确"
```bash
# 解决方案
# 确保Access Key以AKIA开头
AWS_ACCESS_KEY_ID=AKIA...  # ✅ 正确
AWS_ACCESS_KEY_ID=ASIA...  # ❌ 这是临时凭证，不支持
```

#### 问题2: "模型访问被拒绝"
```bash
# 解决方案：在AWS控制台启用模型访问
# 1. 登录AWS控制台
# 2. 进入Bedrock服务
# 3. 点击"Model access"
# 4. 启用Claude 4.0 Sonnet模型
```

#### 问题3: "区域不支持Bedrock"
```bash
# 支持的区域列表
us-west-2     # ✅ Oregon (推荐)
us-east-1     # ✅ N. Virginia
eu-west-3     # ✅ Paris
ap-southeast-2 # ✅ Sydney
```

### OpenAI API 配置问题

#### 问题1: "API Key无效"
```bash
# 解决方案
# 1. 检查API Key格式 (sk-...)
# 2. 确认账户有足够额度
# 3. 验证API Key权限
```

#### 问题2: "模型不可用"
```bash
# 模型可用性检查
gpt-4o        # ✅ 推荐
gpt-4         # ✅ 需要API访问权限
gpt-3.5-turbo # ✅ 广泛可用
```

### 服务启动问题

#### 问题1: "端口被占用"
```bash
# 检查端口占用
lsof -i :8080  # Web服务
lsof -i :8082  # AutoGen服务
lsof -i :3002  # 测试服务

# 终止占用进程
kill -9 <PID>

# 或使用脚本停止服务
./stop-all-services.sh
```

#### 问题2: "npm依赖安装失败"
```bash
# 清理并重新安装
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Docker 部署问题

#### 问题1: "容器无法启动"
```bash
# 查看容器日志
docker-compose logs -f

# 重新构建镜像
docker-compose build --no-cache
docker-compose up -d
```

#### 问题2: "环境变量未生效"
```bash
# 确保.env文件存在且格式正确
cat .env
# AWS_ACCESS_KEY_ID=your_key
# AWS_SECRET_ACCESS_KEY=your_secret

# 重启容器使环境变量生效
docker-compose restart
```

### 性能优化建议

#### 大文件处理
```bash
# 对于大型线程转储文件（>1MB）
# 1. 建议使用本地部署而非在线版本
# 2. 适当增加分析超时时间
# 3. 考虑分片分析大型文件
```

#### API调用优化
```bash
# OpenAI API优化
# 1. 使用GPT-4o代替GPT-4降低成本
# 2. 设置合理的token限制
# 3. 缓存重复分析结果

# AWS Bedrock优化  
# 1. 选择合适的区域减少延迟
# 2. 使用临时凭证增强安全性
# 3. 监控API调用量和成本
```

## 🔒 隐私安全

- **本地处理**: 线程转储文件在本地处理，不上传到服务器
- **API安全**: 仅调用AI API进行分析，不存储敏感数据
- **配置保护**: API密钥仅保存在浏览器本地存储

## 🛠️ 技术栈

- **前端**: HTML5, Bootstrap 5, JavaScript
- **AI集成**: OpenAI API, AWS Bedrock
- **后端**: Node.js (可选，用于Bedrock测试)
- **部署**: GitHub Pages

## 📈 版本历史

### v2.1.0 (2025-01-24)
- 🔐 **安全增强**: 完善的安全配置和凭证管理
- 🚀 **统一启动**: 新增 `start-all-services.sh` 和 `stop-all-services.sh`
- 🐳 **Docker优化**: 改进Docker配置，支持健康检查
- 📚 **文档完善**: 全面的故障排除指南和使用说明
- 🧹 **代码清理**: 移除冗余文件，改进项目结构

### v2.0.0 (2024-12-15)
- 🤖 **AI增强**: 集成OpenAI GPT和AWS Bedrock双AI支持
- 🎯 **智能分析**: AI健康评分、问题检测、优化建议
- 🔧 **AutoGen集成**: AWS Bedrock AutoGen框架支持
- 🌐 **多模型**: 支持Claude、GPT、Llama、Mistral等模型

### v1.0.0 (2024-10-01)
- 📊 **基础版本**: 基于原始jstack.review的传统线程分析
- 🎨 **界面优化**: Bootstrap 5现代化界面
- 📁 **文件处理**: 支持多种线程转储文件格式

## 🔧 开发指南

### 开发环境设置

```bash
# 1. Fork 并克隆仓库
git clone https://github.com/你的用户名/jstack-review.git
cd jstack-review

# 2. 安装开发依赖
npm install --include=dev

# 3. 配置开发环境
cp .env.example .env.development
nano .env.development

# 4. 启动开发服务器
npm run dev
```

### 项目架构说明

#### 前端架构
- **纯JavaScript**: 无需构建工具，直接在浏览器运行
- **模块化设计**: 核心逻辑、AI集成、渲染分离
- **本地存储**: API密钥和配置保存在localStorage

#### 后端架构
- **Express.js**: 轻量级API服务器
- **AWS SDK**: Bedrock服务集成
- **多进程**: 支持并发的AI请求处理

#### 数据流
```
用户上传文件 → 本地解析 → AI API调用 → 结果处理 → 报告展示
```

### 代码规范

#### JavaScript规范
```javascript
// 使用const/let，避免var
const config = { ... };

// 函数命名采用camelCase
function analyzeThreadDump() { ... }

// 异步处理使用async/await
async function callAI(prompt) {
    const response = await fetch(url, options);
    return response.json();
}
```

#### 文件命名规范
```
ai-simple.html        # 主要功能页面
jtdajs.*.js          # 核心逻辑文件
*-server.js          # 后端服务文件
start-*.sh           # 启动脚本
```

### 新功能开发

#### 添加新的AI提供商
1. 在 `ai-simple.html` 中添加配置界面
2. 实现API调用逻辑
3. 添加模型选择和测试功能
4. 更新配置存储结构

#### 扩展分析功能
1. 修改 `jtdajs.ai.js` 核心分析逻辑
2. 更新AI提示词模板
3. 增强结果解析和展示
4. 添加相应的测试用例

### 测试指南

#### 手动测试
```bash
# 启动测试环境
./start-all-services.sh

# 测试各个端点
curl http://localhost:8080/health
curl http://localhost:8082/health  
curl http://localhost:3002/health

# 测试AI配置
# 使用浏览器访问配置页面进行测试
```

#### 自动化测试
```bash
# 运行测试套件
npm test

# 测试特定功能
npm run test:ai
npm run test:bedrock
```

### 贡献流程

1. **Fork项目**: 创建你的分支
2. **创建功能分支**: `git checkout -b feature/amazing-feature`
3. **提交更改**: `git commit -m 'Add amazing feature'`
4. **推送分支**: `git push origin feature/amazing-feature`
5. **创建PR**: 提交Pull Request

### 调试技巧

#### 前端调试
```javascript
// 开启详细日志
localStorage.setItem('debug', 'true');

// 查看AI配置
console.log(localStorage.getItem('aiConfig'));

// 监控API调用
// 打开浏览器开发者工具Network面板
```

#### 后端调试
```bash
# 查看服务日志
tail -f logs/autogen-bedrock.log
tail -f logs/bedrock-test.log

# 调试模式启动
DEBUG=* node autogen-bedrock-server.js
```

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

本项目基于Apache License 2.0许可证。

- Copyright 2014-2016 Spotify AB
- Copyright 2016-2018 MP Objects BV  
- Copyright 2020 jstack.review
- Copyright 2024 AI Enhanced Version

## 🔗 相关链接

- [原始项目](https://github.com/spotify/threaddump-analyzer)
- [jstack.review](https://jstack.review)
- [OpenAI Platform](https://platform.openai.com)
- [AWS Bedrock](https://aws.amazon.com/bedrock/)

[logo]: https://jstack.review/logo.svg

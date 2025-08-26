# CLAUDE.md

## 🔐 安全配置

**重要：在提交Git之前，请确保遵循以下安全要求：**

### 环境变量配置
```bash
# 复制环境变量模板并配置凭证
cp .env.example .env

# 编辑 .env 文件，填入实际凭证（永远不要提交此文件）
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=us-west-2
```

### Git提交前检查清单
- ✅ 确保 `.env` 文件在 `.gitignore` 中
- ✅ 检查没有硬编码的API密钥或凭证
- ✅ 清理日志文件中的敏感信息
- ✅ 删除包含真实凭证的测试文件

### 测试文件安全
- 测试文件应使用环境变量或假凭证
- 示例：`process.env.AWS_ACCESS_KEY_ID || "AKIAEXAMPLEKEYID1234"`
- 永远不要提交真实的AWS凭证


## Common Development Commands

### Setup & Installation

#### 方式一：NPM单端口部署（推荐开发和生产）

```bash
# Install project dependencies
npm install

# Start single-port service (unified deployment)
npm run single-port
# or
./start-single-port.sh

# Stop services
npm run stop
# or
./stop-single-port.sh

# Check service health
npm run health
# or
./health-check.sh

# Access URLs:
# - AI Analyzer: http://localhost:8080/ai-simple.html
# - Traditional: http://localhost:8080/test.html
```

**Architecture**:
- External port: 8080 (Unified HTTP server + API proxy)
- Internal port: 8082 (AutoGen Bedrock API server, not exposed)
- Security: Only one port exposed, internal services fully isolated

#### 方式二：Docker部署（推荐生产环境）

```bash
# Standard deployment
docker-compose up -d

# With nginx reverse proxy
docker-compose --profile with-nginx up -d

# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

#### 方式三：本地直接运行（开发调试）

```bash
# Start all services (Web:8080 + AutoGen:8082 + Test:3002)
./start-all-services.sh

# Stop all services
./stop-all-services.sh

# Check service status
curl http://localhost:8080  # Web server
curl http://localhost:8082/health  # AutoGen Bedrock API
curl http://localhost:3002/health  # Bedrock test API
```

**部署方式对比**:
- **NPM单端口**：简单安全，单端口对外，避免防火墙配置，推荐大部分场景
- **Docker部署**：环境一致，避免依赖冲突，生产环境更稳定
- **本地运行**：开发调试方便，直接访问源码和日志

### Running Individual Services

```bash
# Start web server only
npm run web

# Start AutoGen server only
npm run autogen

# Start Bedrock test service only
npm run bedrock

# Start development mode with auto-reload
npm run dev

# Run tests
npm run test
```

## Architecture Overview

This is an AI-enhanced Java thread dump analyzer that helps developers analyze Java application performance issues. The application integrates with both OpenAI and AWS Bedrock AI services to provide intelligent analysis of thread dumps.

### Key Components

1. **Frontend**
   - HTML/CSS/JavaScript-based web application
   - Bootstrap 5 for UI components
   - Client-side processing (no data is sent to servers)
   - Local storage for API credentials

2. **AI Integration**
   - Dual provider support: OpenAI GPT and AWS Bedrock
   - Models supported include Claude, GPT-4o/4, Llama, Mistral, etc.
   - AI configuration stored in browser's local storage

3. **Backend Services**
   - `autogen-bedrock-server.js`: Main AWS Bedrock integration server (port 3003)
   - `bedrock-test-server.js`: Credentials testing service (port 3002)
   - Both are Express.js based APIs that handle AWS Bedrock interactions

4. **Thread Analysis Core**
   - Original thread dump parsing logic in `jtdajs.js`
   - AI-enhanced analysis in `jtdajs.ai.js`
   - Rendering logic in corresponding `.render.js` files

### Data Flow

1. User uploads thread dump file (or uses demo data)
2. File is parsed and analyzed locally in the browser
3. If AI configuration is available, the file content is sent to AI for enhanced analysis
4. Results are displayed to the user with health score, recommendations, etc.

### Security Model

- All thread dump processing happens client-side
- API keys are stored only in browser local storage
- No thread data is stored on servers
- AWS credentials are used only for model inference

## Project Structure

- `ai-simple.html`: Main AI-enhanced analyzer interface
- `test.html`: Traditional thread dump analyzer
- `autogen-bedrock-server.js`: AWS Bedrock integration server
- `bedrock-test-server.js`: Credentials testing service
- `jtdajs.js`, `jtdajs.ai.js`: Core analysis logic
- `*.render.js`: UI rendering logic
- Deployment scripts in various `.sh` files

## Development Tips

1. For AWS Bedrock integration development, use the test endpoints:
   - `POST /api/test-autogen-bedrock`: Tests AWS credentials and model access
   - `POST /api/invoke-autogen-bedrock`: Invokes the AI model

2. When working with the frontend, remember to test both OpenAI and AWS Bedrock integration paths

3. All credentials handling is client-side, never store sensitive information on the server
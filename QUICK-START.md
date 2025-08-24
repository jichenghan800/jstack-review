# 🚀 快速开始

## 一键部署到Ubuntu服务器

### 方法1: 完整部署 (推荐)

```bash
curl -fsSL https://raw.githubusercontent.com/jichenghan800/jstack-review/gh-pages/deploy.sh | bash
```

### 方法2: 快速部署

```bash
curl -fsSL https://raw.githubusercontent.com/jichenghan800/jstack-review/gh-pages/quick-deploy.sh | bash
```

## 启动服务

```bash
cd ~/jstack-review
./start-all.sh
```

## 访问地址

- **AI分析器**: http://localhost:8080/ai-simple.html
- **传统分析器**: http://localhost:8080/test.html

## 配置AI服务

1. **OpenAI**: 在AI配置中填写API Key
2. **AWS Bedrock**: 填写AWS Access Key和Secret Key

就这么简单！🎉

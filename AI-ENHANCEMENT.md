# 🤖 AI 增强 Java 线程转储分析器 (AWS Bedrock 版本)

## 概述

这是一个集成了 **AWS Bedrock Claude 3.5 Sonnet** 真实 AI 能力的 Java 线程转储分析器增强版本。在原有功能基础上，新增了基于真实 AI 的智能分析、问题诊断和优化建议等功能。

## 🚀 核心 AI 功能

### 1. 真实 AWS Bedrock 集成
- **Claude 3.5 Sonnet**: 使用最新的 Claude 3.5 Sonnet v2 模型
- **安全凭证管理**: 本地存储 AWS 凭证，支持临时凭证
- **多区域支持**: 支持多个 AWS 区域的 Bedrock 服务
- **智能回退**: 当 AWS 不可用时自动回退到模拟模式

### 2. 智能分析能力
- **深度线程分析**: AI 理解线程状态和调用栈
- **模式识别**: 自动识别常见的性能问题模式
- **根因分析**: 深入分析问题的根本原因
- **预测性建议**: 基于历史模式提供预防性建议

### 3. 增强诊断报告
- **结构化分析**: JSON 格式的详细分析结果
- **优先级分类**: 按严重程度和紧急程度分类问题
- **可操作建议**: 提供具体的代码和配置优化建议
- **性能评分**: 量化的系统健康和性能指标

## 📁 文件结构

```
jstack-review/
├── jtdajs.aws.bedrock.js      # AWS Bedrock 集成核心
├── aws-config.js              # AWS 配置界面
├── bedrock-proxy.py           # AWS Bedrock 代理服务器
├── frontend.ai.js             # AI 增强前端逻辑
├── requirements.txt           # Python 依赖
├── start-with-bedrock.sh      # 完整启动脚本
└── AI-ENHANCEMENT.md          # 本说明文档
```

## 🔧 安装和配置

### 1. 系统要求
- Python 3.7+
- pip3
- 现代浏览器 (Chrome, Firefox, Safari, Edge)
- AWS 账户和 Bedrock 访问权限

### 2. 安装依赖
```bash
# 安装 Python 依赖
pip3 install -r requirements.txt

# 或手动安装
pip3 install boto3
```

### 3. AWS Bedrock 准备
1. **启用 Bedrock 服务**: 在 AWS 控制台中启用 Amazon Bedrock
2. **模型访问**: 申请 Claude 3.5 Sonnet 模型访问权限
3. **IAM 权限**: 确保您的 AWS 用户有 `bedrock:InvokeModel` 权限
4. **区域选择**: 选择支持 Bedrock 的区域 (如 us-east-1, us-west-2)

### 4. 启动服务
```bash
# 使用完整启动脚本 (推荐)
./start-with-bedrock.sh

# 或分别启动
python3 -m http.server 8080 &          # 主服务器
python3 bedrock-proxy.py --port 8081 & # 代理服务器
```

## ⚙️ AWS 配置步骤

### 1. 获取 AWS 凭证
```bash
# 方式1: 使用 AWS CLI 配置
aws configure

# 方式2: 使用环境变量
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=us-east-1

# 方式3: 在应用中直接配置 (不推荐用于生产)
```

### 2. 在应用中配置
1. 打开 `http://localhost:8080`
2. 点击导航栏 "AWS 配置"
3. 填写配置信息：
   - **AWS 区域**: 选择您的 Bedrock 可用区域
   - **Access Key ID**: 您的 AWS 访问密钥
   - **Secret Access Key**: 您的 AWS 秘密密钥
   - **Session Token**: (可选) 临时凭证的会话令牌
4. 点击 "测试连接" 验证配置
5. 保存配置

### 3. 配置验证
- ✅ 连接成功: 显示绿色成功消息
- ❌ 连接失败: 检查凭证和网络连接
- ⚠️ 权限不足: 检查 IAM 权限配置

## 🎯 使用方法

### 1. 基本使用
1. 启动服务: `./start-with-bedrock.sh`
2. 打开浏览器: `http://localhost:8080`
3. 配置 AWS Bedrock (首次使用)
4. 上传线程转储文件或使用示例文件
5. 查看 AI 分析结果

### 2. AI 功能控制
- **启用/禁用**: 使用导航栏的 AI 分析开关
- **模式切换**: 自动在真实 AI 和模拟模式间切换
- **状态监控**: 实时显示 AI 服务状态

### 3. 分析结果解读
- **健康评分**: 0-100 分的系统健康评估
- **关键问题**: 按严重程度排序的问题列表
- **优化建议**: 具体的代码和配置改进建议
- **可视化图表**: 线程分布和资源争用热力图

## 🔍 AI 分析示例

### 输入数据
```
线程转储摘要:
- 总线程数: 25
- 死锁数量: 1
- BLOCKED 线程: 8
- WAITING 线程: 12
- RUNNABLE 线程: 5
```

### AI 分析结果
```json
{
  "summary": {
    "overallHealth": {
      "score": 35,
      "level": "critical",
      "issues": ["检测到死锁", "大量线程阻塞"]
    },
    "criticalIssues": [
      {
        "type": "deadlock",
        "severity": "critical",
        "title": "死锁检测",
        "description": "检测到 1 个死锁，涉及 DatabaseService 和 CacheService",
        "recommendation": "重新设计锁获取顺序，使用超时机制"
      }
    ]
  },
  "insights": {
    "recommendations": [
      {
        "category": "synchronization",
        "priority": "high",
        "title": "解决死锁问题",
        "actions": [
          "统一锁获取顺序",
          "使用 tryLock 替代 synchronized",
          "减少锁持有时间"
        ]
      }
    ]
  }
}
```

## 🛠️ 技术架构

### 1. 前端架构
```
浏览器 → AI 配置界面 → AWS Bedrock 客户端 → 代理服务器 → AWS Bedrock
```

### 2. 后端代理
- **CORS 处理**: 解决浏览器跨域限制
- **凭证管理**: 安全处理 AWS 凭证
- **错误处理**: 优雅的错误处理和重试机制
- **日志记录**: 详细的请求和响应日志

### 3. 安全考虑
- **本地存储**: 凭证仅存储在浏览器本地
- **HTTPS 支持**: 生产环境建议使用 HTTPS
- **凭证轮换**: 支持临时凭证和定期轮换
- **最小权限**: 仅需要 `bedrock:InvokeModel` 权限

## 📊 性能和成本

### 1. 性能指标
- **响应时间**: 通常 2-10 秒 (取决于线程转储大小)
- **并发支持**: 支持多个并发分析请求
- **缓存机制**: 相同输入的结果可以缓存

### 2. 成本估算
- **Claude 3.5 Sonnet**: ~$3/1M 输入 tokens, ~$15/1M 输出 tokens
- **典型分析**: 每次分析约 1000-5000 tokens
- **预估成本**: 每次分析 $0.01-0.05

### 3. 优化建议
- 使用 Claude 3 Haiku 进行快速分析 (成本更低)
- 实现结果缓存减少重复请求
- 批量处理多个线程转储

## 🔮 高级功能

### 1. 自定义提示词
```javascript
// 自定义分析提示词
var customPrompt = `
作为 Java 性能专家，请特别关注:
1. 数据库连接池问题
2. 缓存争用情况
3. GC 相关线程状态
`;
```

### 2. 批量分析
```bash
# 批量处理多个转储文件
for file in *.dump; do
    curl -X POST http://localhost:8080/api/analyze \
         -F "file=@$file" \
         -F "ai_enabled=true"
done
```

### 3. API 集成
```javascript
// 程序化调用 AI 分析
fetch('/api/bedrock-proxy', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        config: awsConfig,
        body: analysisRequest
    })
});
```

## 🚨 故障排除

### 1. 常见问题

#### AWS 凭证错误
```
错误: InvalidSignatureException
解决: 检查 Access Key 和 Secret Key 是否正确
```

#### 模型访问被拒绝
```
错误: AccessDeniedException
解决: 在 AWS 控制台申请 Claude 模型访问权限
```

#### 代理服务器连接失败
```
错误: PROXY_NOT_AVAILABLE
解决: 确保代理服务器在端口 8081 运行
```

### 2. 日志分析
```bash
# 查看主服务器日志
tail -f server.log

# 查看代理服务器日志
tail -f proxy.log

# 查看浏览器控制台
# 按 F12 打开开发者工具
```

### 3. 网络问题
- 检查防火墙设置
- 确认 AWS 区域可访问性
- 验证网络连接稳定性

## 📄 许可证和致谢

本增强版本遵循原项目的 Apache 2.0 许可证。

**致谢:**
- 原始项目: [Spotify Thread Dump Analyzer](https://github.com/spotify/threaddump-analyzer)
- AI 能力: AWS Bedrock Claude 3.5 Sonnet
- 图表库: Chart.js
- UI 框架: Bootstrap 3

---

**🎉 享受真正的 AI 增强线程转储分析体验！**

如有问题或建议，请查看日志文件或联系技术支持。

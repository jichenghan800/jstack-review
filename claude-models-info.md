# AWS Bedrock Claude 模型说明

## 🤖 关于 Claude 4.0 Sonnet

**重要说明**: AWS Bedrock 中目前没有名为 "Claude 4.0 Sonnet" 的独立模型。

### 📋 可用模型列表

| 模型名称 | Bedrock 模型 ID | 性能等级 | 价格 (输入/输出) |
|---------|----------------|----------|------------------|
| **Claude 3.5 Sonnet v2** ⭐ | `anthropic.claude-3-5-sonnet-20241022-v2:0` | 最高 | $3/$15 per 1M tokens |
| Claude 3.5 Sonnet v1 | `anthropic.claude-3-5-sonnet-20240620-v1:0` | 很高 | $3/$15 per 1M tokens |
| Claude 3 Sonnet | `anthropic.claude-3-sonnet-20240229-v1:0` | 高 | $3/$15 per 1M tokens |
| Claude 3 Haiku | `anthropic.claude-3-haiku-20240307-v1:0` | 中等 | $0.25/$1.25 per 1M tokens |

### 🎯 推荐选择

**对于 800KB 线程转储分析，推荐使用:**
- **Claude 3.5 Sonnet v2** - 最新最强的模型，性能相当于或超过 Claude 4.0 Sonnet

### 💡 模型选择指南

1. **Claude 3.5 Sonnet v2** (推荐)
   - 最新的模型，2024年10月发布
   - 在代码分析、技术诊断方面表现最佳
   - 相当于传统意义上的 "Claude 4.0 Sonnet"

2. **Claude 3.5 Sonnet v1**
   - 较新版本，性能优秀
   - 如果 v2 不可用时的备选

3. **Claude 3 Sonnet**
   - 稳定可靠的版本
   - 适合一般分析需求

4. **Claude 3 Haiku**
   - 经济型选择，成本低
   - 适合简单分析或预算有限时

### 🔍 如何确认模型可用性

在 AWS 控制台中检查：
1. 进入 AWS Bedrock 控制台
2. 选择 "Model access" 
3. 确认 Claude 模型的访问状态
4. 如需要，申请模型访问权限

### 📝 配置建议

对于你的 800KB 文件分析：
- **模型**: Claude 3.5 Sonnet v2
- **Token 数**: 5000
- **温度**: 0.15
- **预估费用**: ~$0.675

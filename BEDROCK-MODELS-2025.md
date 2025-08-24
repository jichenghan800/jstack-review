# AWS Bedrock 模型指南 (2025年最新)

## 🚨 重要：正确的模型ID格式

AWS Bedrock模型ID必须使用 `us.` 前缀格式，例如：
- ✅ 正确：`us.anthropic.claude-sonnet-4-20250514-v1:0`
- ❌ 错误：`anthropic.claude-3-5-sonnet-20241022-v2:0`

## 🤖 Anthropic Claude 系列 (推荐)

### Claude 4.0 Sonnet (最新推荐)
- **模型ID**: `us.anthropic.claude-sonnet-4-20250514-v1:0`
- **特点**: 2025年5月最新版本，Claude 4.0系列
- **适用**: 复杂推理、代码分析、长文本处理
- **上下文**: 200K tokens
- **推荐用途**: Java线程分析、性能诊断

### Claude 3.5 Sonnet v2
- **模型ID**: `us.anthropic.claude-3-5-sonnet-20241022-v2:0`
- **特点**: 性能大幅提升的3.5版本
- **适用**: 复杂分析任务
- **上下文**: 200K tokens

### Claude 3.5 Haiku
- **模型ID**: `us.anthropic.claude-3-5-haiku-20241022-v1:0`
- **特点**: 速度极快，成本低
- **适用**: 快速分析、简单任务
- **上下文**: 200K tokens
- **推荐用途**: 快速线程状态检查

## 🆕 Amazon Nova 系列 (2024新发布)

### Nova Pro (多模态)
- **模型ID**: `us.amazon.nova-pro-v1:0`
- **特点**: 支持文本、图像、视频
- **适用**: 多模态分析
- **上下文**: 300K tokens

### Nova Lite (轻量级)
- **模型ID**: `us.amazon.nova-lite-v1:0`
- **特点**: 快速响应，低成本
- **适用**: 简单文本任务

### Nova Micro (超快速)
- **模型ID**: `us.amazon.nova-micro-v1:0`
- **特点**: 毫秒级响应
- **适用**: 实时分析

## 🔥 Meta Llama 3.2 系列 (2024最新)

### Llama 3.2 90B Instruct
- **模型ID**: `us.meta.llama3-2-90b-instruct-v1:0`
- **特点**: 大型模型，强大推理能力
- **适用**: 复杂分析任务

### Llama 3.1 405B Instruct (超大模型)
- **模型ID**: `us.meta.llama3-1-405b-instruct-v1:0`
- **特点**: 最大的开源模型
- **适用**: 最复杂的分析任务
- **注意**: 成本较高，响应较慢

## 🚀 Mistral AI 系列 (2024更新)

### Mistral Large 2 (最新)
- **模型ID**: `us.mistral.mistral-large-2407-v1:0`
- **特点**: 多语言支持，代码能力强
- **适用**: 代码分析、技术文档

## 🎯 AI21 Labs Jamba 1.5 (2024新版本)

### Jamba 1.5 Large
- **模型ID**: `us.ai21.jamba-1-5-large-v1:0`
- **特点**: 混合架构，长上下文
- **适用**: 长文档分析

## 📊 模型选择建议

### 🏆 线程分析推荐排序

1. **Claude 4.0 Sonnet** - 最新最强模型
2. **Claude 3.5 Sonnet v2** - 稳定可靠
3. **Nova Pro** - 多模态能力
4. **Llama 3.2 90B** - 开源最强
5. **Claude 3.5 Haiku** - 快速分析

### 💰 成本考虑

- **最经济**: Nova Micro, Claude 3.5 Haiku
- **平衡**: Claude 3.5 Sonnet v2, Nova Lite
- **高性能**: Claude 4.0 Sonnet, Llama 3.1 405B

### ⚡ 速度考虑

- **最快**: Nova Micro, Claude 3.5 Haiku
- **中等**: Claude 4.0 Sonnet, Nova Lite
- **较慢**: Llama 3.1 405B, Nova Pro

## 🔧 配置建议

### 线程分析最佳配置
```json
{
  "model": "us.anthropic.claude-sonnet-4-20250514-v1:0",
  "region": "us-east-1",
  "maxTokens": 4000,
  "temperature": 0.1,
  "topP": 0.9
}
```

### 快速分析配置
```json
{
  "model": "us.anthropic.claude-3-5-haiku-20241022-v1:0",
  "region": "us-west-2",
  "maxTokens": 2000,
  "temperature": 0.1,
  "topP": 0.9
}
```

## ⚠️ 重要提醒

1. **模型ID格式**: 必须使用 `us.` 前缀
2. **区域限制**: 某些模型仅在特定区域可用
3. **权限要求**: 需要正确的IAM权限
4. **API调用**: 使用正确的模型ID才能成功调用

## 📈 2025年更新内容

- ✅ 修正模型ID格式 (添加us.前缀)
- ✅ 添加Claude 4.0 Sonnet (最新)
- ✅ 更新所有模型ID为正确格式
- ✅ 验证模型可用性
- ✅ 优化推荐配置

## 🔗 相关链接

- [AWS Bedrock 官方文档](https://docs.aws.amazon.com/bedrock/)
- [模型定价](https://aws.amazon.com/bedrock/pricing/)
- [区域可用性](https://docs.aws.amazon.com/bedrock/latest/userguide/bedrock-regions.html)

# 更新日志

## [Unreleased]

### 新增
- AWS Bedrock 模型动态获取功能
  - 添加自动加载模型列表功能
  - 根据AWS账户权限自动显示可用模型

### 修复
- 解决不同AWS区域模型兼容性问题
  - 修复 "请求的模型在当前区域不可用" 错误
  - 改进模型ID前缀格式兼容性 (us.anthropic.* vs anthropic.*)
- 修复AI深度分析报告无法显示的问题
  - 修复Claude模型API请求格式问题
  - 增强响应解析逻辑，适应不同版本Claude模型
- 修复页面按钮不响应问题
  - 解决"Demo 演示"和"AI 配置"按钮点击无响应

### 优化
- 模型列表显示按提供商分组
- 优化模型名称显示逻辑
- 添加模型加载状态提示
- 增强US前缀模型ID处理逻辑
  - 自动检测并转换需要US前缀的Claude模型
  - 支持完整推理配置文件ID

## [2.0.0] - 2025-08-23

### 修复
- 修复AWS Bedrock模型调用问题
  - 解决模型ID格式处理问题
  - 特别支持带有`us.`前缀的Claude模型
  - 优化模型请求和响应处理
  - 修复Claude模型的消息格式处理

### 详细修复
- 增强模型ID处理逻辑:
  ```javascript
  // 支持直接传递us.前缀的模型ID
  if (modelId.startsWith('us.')) {
      // 使用完整ID
  } 
  // 如果是没有us.前缀但需要特殊处理的新模型
  else if (modelId.includes('claude-3-7') || modelId.includes('claude-sonnet-4')) {
      // 添加us.前缀
      actualModelId = 'us.' + modelId;
  }
  ```
- 改进Claude API消息格式处理
- 增强响应解析逻辑，适应新旧Claude模型

## [2.0.0] - 2025-08-10

### 新增
- 添加完整的服务管理脚本套件
- 添加完整的一键重新部署脚本套件
- 集成AutoGen Bedrock服务到AI配置功能

### 修复
- 紧急修复: 回滚到工作按钮版本

### 优化
- 添加AutoGen框架Bedrock集成
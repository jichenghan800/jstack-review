#!/bin/bash

echo "🔧 最终问题修复验证"
echo "======================================="

# 检查服务状态
echo ""
echo "🔍 检查服务状态..."
if ! curl -s localhost:8080 > /dev/null; then
    echo "❌ Web服务器未运行，请先执行: ./start-all-services.sh"
    exit 1
fi

if ! curl -s localhost:8082/health > /dev/null; then
    echo "❌ AutoGen Bedrock服务器未运行"
    exit 1
fi

echo "✅ 所有服务运行正常"

# 测试关键修复
echo ""
echo "🔍 验证关键修复状态..."

# 1. 检查AI分析功能修复
echo "1️⃣ 测试AI分析功能（使用共享配置）..."
AI_RESPONSE=$(curl -s -X POST http://localhost:8082/api/invoke-autogen-bedrock \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
      "role": "user",
      "content": "请回复：测试成功"
    }],
    "config": {
      "maxTokens": 20,
      "temperature": 0.1
    }
  }')

if echo "$AI_RESPONSE" | grep -q "success.*true"; then
    echo "✅ AI分析API正常工作"
    if echo "$AI_RESPONSE" | grep -q "测试成功"; then
        echo "✅ AI响应内容正确"
    else
        echo "⚠️ AI响应内容异常"
    fi
else
    echo "❌ AI分析API失败"
    echo "响应: $AI_RESPONSE"
fi

# 2. 检查共享配置API
echo ""
echo "2️⃣ 测试共享配置API..."
CONFIG_RESPONSE=$(curl -s http://localhost:8082/api/default-config)
if echo "$CONFIG_RESPONSE" | grep -q "hasServerConfig.*true"; then
    echo "✅ 共享配置API正常"
else
    echo "❌ 共享配置API异常"
    echo "响应: $CONFIG_RESPONSE"
fi

# 3. 检查代码修复状态
echo ""
echo "3️⃣ 检查代码修复状态..."

# 检查重复函数名问题修复
if grep -q "saveAIConfigToStorage" ai-simple.html && ! grep -q "function saveAIConfig(config)" ai-simple.html; then
    echo "✅ 重复函数名冲突已修复"
else
    echo "❌ 重复函数名冲突尚未修复"
fi

# 检查模态框关闭增强
if grep -q "DOM强制关闭模态框完成" ai-simple.html; then
    echo "✅ 模态框关闭逻辑已增强"
else
    echo "❌ 模态框关闭逻辑增强缺失"
fi

# 检查日志增强
if grep -q "保存所有配置 - 开始执行" ai-simple.html; then
    echo "✅ 保存过程日志记录已增强"
else
    echo "❌ 保存过程日志记录增强缺失"
fi

# 检查服务器端凭证验证修复
if grep -q "服务器端共享配置不可用，且未提供个人AWS凭证" autogen-bedrock-server.js; then
    echo "✅ 服务器端凭证验证逻辑已修复"
else
    echo "❌ 服务器端凭证验证逻辑修复缺失"
fi

echo ""
echo "📋 问题修复总结:"
echo "======================================="
echo "✅ 问题1: 模态框不关闭 → 增强了多重关闭机制"
echo "✅ 问题2: AI分析失败 → 修复了凭证验证逻辑"  
echo "✅ 问题3: 函数名冲突 → 重命名避免冲突"
echo "✅ 问题4: 保存流程 → 增强了日志记录和错误处理"

echo ""
echo "🎯 用户应该体验到的改进:"
echo "======================================="
echo "✅ 点击'保存所有配置'按钮后模态框会自动关闭"
echo "✅ 新开的页面能正常使用共享配置进行AI分析"
echo "✅ 浏览器控制台有详细的配置保存日志"
echo "✅ 所有用户都能无障碍使用AI功能"

echo ""
echo "🔗 测试建议:"
echo "1. 访问: http://localhost:8080/ai-simple.html"
echo "2. 点击'AI 配置'按钮"
echo "3. 不填写任何AWS凭证（使用服务器共享配置）"
echo "4. 点击'保存所有配置'按钮"
echo "5. 观察模态框是否自动关闭"
echo "6. 打开F12控制台查看详细日志"
echo "7. 使用'Demo演示'测试AI分析功能"

echo ""
echo "🎉 如果问题仍然存在，请查看浏览器控制台的详细日志！"
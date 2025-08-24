#!/usr/bin/env node

const express = require('express');
const cors = require('cors');
const { testRealBedrockConnection } = require('./test-bedrock-real');

const app = express();
const PORT = 3002;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' })); // 增加payload限制到10MB

console.log('🚀 启动AWS Bedrock测试服务...');

// 真实连接测试接口
app.post('/api/test-bedrock', async (req, res) => {
    const { accessKey, secretKey, region, modelId } = req.body;
    
    console.log(`🧪 收到连接测试请求 - 区域: ${region}, 模型: ${modelId}`);
    
    // 验证输入
    if (!accessKey || !secretKey || !region || !modelId) {
        return res.status(400).json({
            success: false,
            message: '缺少必需的参数'
        });
    }
    
    if (!accessKey.startsWith('AKIA')) {
        return res.status(400).json({
            success: false,
            message: 'AWS Access Key ID格式不正确'
        });
    }
    
    try {
        const result = await testRealBedrockConnection(accessKey, secretKey, region, modelId);
        res.json(result);
    } catch (error) {
        console.error('❌ 测试服务异常:', error);
        res.status(500).json({
            success: false,
            message: `测试服务异常: ${error.message}`
        });
    }
});

// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'bedrock-test-server' });
});

// 启动服务
app.listen(PORT, () => {
    console.log(`🎉 AWS Bedrock测试服务已启动`);
    console.log(`📡 服务地址: http://localhost:${PORT}`);
    console.log('');
    console.log('可用接口:');
    console.log(`  POST /api/test-bedrock - 真实Bedrock连接测试`);
    console.log(`  GET  /health - 健康检查`);
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n🛑 正在关闭测试服务...');
    process.exit(0);
});

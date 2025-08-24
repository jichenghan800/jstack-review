#!/usr/bin/env node

// AWS Bedrock 模型可用性检查工具
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

async function checkBedrockModels(region = 'us-west-2') {
    console.log(`🔍 检查 AWS Bedrock 在区域 ${region} 的可用模型...`);
    
    try {
        const { stdout } = await execAsync(`aws bedrock list-foundation-models --region ${region}`);
        const data = JSON.parse(stdout);
        
        console.log(`\n✅ 找到 ${data.modelSummaries.length} 个可用模型\n`);
        
        // 按提供商分组
        const providers = {};
        data.modelSummaries.forEach(model => {
            const provider = model.providerName;
            if (!providers[provider]) {
                providers[provider] = [];
            }
            providers[provider].push(model);
        });
        
        // 显示每个提供商的模型
        Object.keys(providers).sort().forEach(provider => {
            console.log(`📋 ${provider}:`);
            providers[provider].forEach(model => {
                console.log(`   ✓ ${model.modelId}`);
                console.log(`     名称: ${model.modelName}`);
                console.log(`     输入: ${model.inputModalities.join(', ')}`);
                console.log(`     输出: ${model.outputModalities.join(', ')}`);
                console.log('');
            });
        });
        
        // 特别检查Claude模型
        console.log('🤖 Claude 模型详情:');
        const claudeModels = data.modelSummaries.filter(model => 
            model.modelId.includes('claude')
        );
        
        if (claudeModels.length > 0) {
            claudeModels.forEach(model => {
                console.log(`   ✅ ${model.modelId} - ${model.modelName}`);
            });
        } else {
            console.log('   ❌ 未找到Claude模型');
        }
        
        return data.modelSummaries;
        
    } catch (error) {
        console.error('❌ 检查失败:', error.message);
        
        if (error.message.includes('Unable to locate credentials')) {
            console.log('\n💡 解决方案:');
            console.log('1. 配置AWS凭证: aws configure');
            console.log('2. 或设置环境变量:');
            console.log('   export AWS_ACCESS_KEY_ID=your_key');
            console.log('   export AWS_SECRET_ACCESS_KEY=your_secret');
        }
        
        if (error.message.includes('AccessDenied')) {
            console.log('\n💡 权限问题:');
            console.log('需要以下权限:');
            console.log('- bedrock:ListFoundationModels');
        }
        
        return null;
    }
}

// 检查多个区域
async function checkMultipleRegions() {
    const regions = ['us-west-2', 'us-east-1', 'eu-west-1', 'ap-southeast-1'];
    
    for (const region of regions) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`🌍 检查区域: ${region}`);
        console.log('='.repeat(60));
        
        await checkBedrockModels(region);
        
        // 等待一下避免API限制
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const region = process.argv[2] || 'us-west-2';
    
    if (process.argv.includes('--all-regions')) {
        checkMultipleRegions();
    } else {
        checkBedrockModels(region);
    }
}

module.exports = { checkBedrockModels };

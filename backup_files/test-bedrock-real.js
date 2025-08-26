#!/usr/bin/env node

// 真正的AWS Bedrock连接测试
const { exec } = require('child_process');
const util = require('util');
const fs = require('fs').promises;
const path = require('path');

const execAsync = util.promisify(exec);

async function testRealBedrockConnection(accessKey, secretKey, region, modelId) {
    console.log('🧪 开始真实AWS Bedrock连接测试...');
    console.log('📋 配置信息:');
    console.log(`   Access Key: ${accessKey.substring(0, 8)}...`);
    console.log(`   Region: ${region}`);
    console.log(`   Model ID: ${modelId}`);
    
    try {
        // 设置AWS凭证环境变量
        const env = {
            ...process.env,
            AWS_ACCESS_KEY_ID: accessKey,
            AWS_SECRET_ACCESS_KEY: secretKey,
            AWS_REGION: region
        };
        
        console.log('🔑 验证AWS凭证...');
        
        // 1. 测试AWS凭证
        try {
            const { stdout: identity } = await execAsync('aws sts get-caller-identity', { env });
            const identityData = JSON.parse(identity);
            console.log(`✅ AWS身份验证成功: ${identityData.Arn}`);
        } catch (error) {
            throw new Error(`AWS凭证验证失败: ${error.message}`);
        }
        
        console.log('📡 测试Bedrock服务访问...');
        
        // 2. 测试Bedrock服务访问
        try {
            const { stdout: modelsOutput } = await execAsync(`aws bedrock list-foundation-models --region ${region}`, { env });
            const modelsData = JSON.parse(modelsOutput);
            console.log(`✅ Bedrock服务访问成功，找到 ${modelsData.modelSummaries.length} 个模型`);
            
            // 3. 验证目标模型是否可用
            const targetModel = modelsData.modelSummaries.find(model => model.modelId === modelId);
            
            if (targetModel) {
                console.log(`✅ 目标模型可用:`);
                console.log(`   模型名称: ${targetModel.modelName}`);
                console.log(`   提供商: ${targetModel.providerName}`);
                console.log(`   输入模态: ${targetModel.inputModalities.join(', ')}`);
                console.log(`   输出模态: ${targetModel.outputModalities.join(', ')}`);
            } else {
                console.log(`❌ 目标模型不可用: ${modelId}`);
                console.log('可用的Claude模型:');
                modelsData.modelSummaries
                    .filter(model => model.modelId.includes('claude'))
                    .forEach(model => {
                        console.log(`   - ${model.modelId} (${model.modelName})`);
                    });
                throw new Error(`模型 ${modelId} 在区域 ${region} 中不可用`);
            }
            
        } catch (error) {
            if (error.message.includes('AccessDenied')) {
                throw new Error('权限不足，需要bedrock:ListFoundationModels权限');
            }
            throw error;
        }
        
        console.log('🤖 测试模型调用...');
        
        // 4. 测试实际的模型调用
        try {
            const testPrompt = {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 50,
                "messages": [
                    {
                        "role": "user",
                        "content": "请回复'连接测试成功'来确认你能正常工作。"
                    }
                ]
            };
            
            const tempFile = path.join(__dirname, `test_response_${Date.now()}.json`);
            
            const invokeCmd = `aws bedrock-runtime invoke-model --region ${region} --model-id ${modelId} --body '${JSON.stringify(testPrompt)}' --cli-binary-format raw-in-base64-out ${tempFile}`;
            
            await execAsync(invokeCmd, { env });
            
            // 读取响应
            const responseData = await fs.readFile(tempFile, 'utf8');
            const response = JSON.parse(responseData);
            
            // 清理临时文件
            await fs.unlink(tempFile);
            
            if (response.content && response.content[0] && response.content[0].text) {
                const aiResponse = response.content[0].text;
                console.log(`✅ 模型调用成功!`);
                console.log(`🤖 AI响应: ${aiResponse}`);
                
                return {
                    success: true,
                    message: '所有测试通过！AWS Bedrock连接正常',
                    details: {
                        identity: identityData.Arn,
                        modelName: targetModel.modelName,
                        provider: targetModel.providerName,
                        aiResponse: aiResponse
                    }
                };
            } else {
                throw new Error('模型响应格式异常');
            }
            
        } catch (error) {
            if (error.message.includes('ValidationException')) {
                throw new Error('模型调用参数错误或模型不支持');
            } else if (error.message.includes('AccessDenied')) {
                throw new Error('权限不足，需要bedrock:InvokeModel权限');
            }
            throw error;
        }
        
    } catch (error) {
        console.log(`❌ 连接测试失败: ${error.message}`);
        return {
            success: false,
            message: error.message,
            details: null
        };
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length < 4) {
        console.log('用法: node test-bedrock-real.js <ACCESS_KEY> <SECRET_KEY> <REGION> <MODEL_ID>');
        console.log('示例: node test-bedrock-real.js AKIA... your-secret us-west-2 us.anthropic.claude-sonnet-4-20250514-v1:0');
        process.exit(1);
    }
    
    const [accessKey, secretKey, region, modelId] = args;
    
    testRealBedrockConnection(accessKey, secretKey, region, modelId)
        .then(result => {
            console.log('\n🎉 测试完成!');
            console.log('结果:', result.success ? '成功' : '失败');
            console.log('详情:', result.message);
            if (result.details) {
                console.log('详细信息:', result.details);
            }
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('❌ 测试异常:', error.message);
            process.exit(1);
        });
}

module.exports = { testRealBedrockConnection };

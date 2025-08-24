#!/usr/bin/env node

const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const util = require('util');
const fs = require('fs').promises;
const path = require('path');

const execAsync = util.promisify(exec);
const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 设置AWS区域环境变量
process.env.AWS_REGION = 'us-west-2';

console.log('🚀 启动AWS Bedrock服务...');
console.log('🌍 默认区域:', process.env.AWS_REGION);

// 测试AWS Bedrock连接
app.post('/api/test-connection', async (req, res) => {
    const { modelId, region } = req.body;
    
    console.log(`🧪 测试连接 - 模型: ${modelId}, 区域: ${region}`);
    
    try {
        const result = await testBedrockConnection(modelId, region);
        res.json(result);
    } catch (error) {
        console.error('❌ 连接测试失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// AI分析接口
app.post('/api/analyze', async (req, res) => {
    const { content, filename, modelId, region } = req.body;
    
    console.log(`🤖 开始AI分析 - 文件: ${filename}, 模型: ${modelId}`);
    
    try {
        const result = await performBedrockAnalysis(content, filename, modelId, region);
        res.json(result);
    } catch (error) {
        console.error('❌ AI分析失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 测试Bedrock连接
async function testBedrockConnection(modelId, region) {
    const startTime = Date.now();
    
    try {
        console.log('🔍 检查AWS CLI...');
        const { stdout: awsVersion } = await execAsync('aws --version');
        console.log(`✅ AWS CLI: ${awsVersion.trim()}`);
        
        console.log('🔑 检查AWS凭证...');
        const { stdout: identity } = await execAsync(`AWS_REGION=${region} aws sts get-caller-identity`);
        const identityData = JSON.parse(identity);
        console.log(`✅ AWS身份: ${identityData.Arn}`);
        
        console.log('📡 测试Bedrock连接...');
        const { stdout: modelsOutput } = await execAsync(`AWS_REGION=${region} aws bedrock list-foundation-models`);
        const modelsData = JSON.parse(modelsOutput);
        
        const targetModel = modelsData.modelSummaries.find(model => model.modelId === modelId);
        
        const responseTime = Date.now() - startTime;
        
        if (targetModel) {
            console.log(`✅ 模型可用: ${targetModel.modelName}`);
            return {
                success: true,
                responseTime,
                modelStatus: `${targetModel.modelName} - 可用`,
                modelInfo: {
                    name: targetModel.modelName,
                    provider: targetModel.providerName,
                    inputModalities: targetModel.inputModalities,
                    outputModalities: targetModel.outputModalities
                }
            };
        } else {
            const claudeModels = modelsData.modelSummaries
                .filter(model => model.modelId.includes('claude'))
                .map(model => model.modelId);
                
            return {
                success: false,
                responseTime,
                error: `模型 ${modelId} 在区域 ${region} 中不可用`,
                availableModels: claudeModels
            };
        }
        
    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error('❌ 连接测试失败:', error.message);
        
        let errorMessage = error.message;
        if (error.message.includes('could not be located')) {
            errorMessage = 'AWS CLI未安装，请先安装AWS CLI';
        } else if (error.message.includes('Unable to locate credentials')) {
            errorMessage = 'AWS凭证未配置，请运行: aws configure';
        } else if (error.message.includes('AccessDenied')) {
            errorMessage = 'AWS权限不足，需要bedrock:ListFoundationModels权限';
        }
        
        return {
            success: false,
            responseTime,
            error: errorMessage
        };
    }
}

// 执行Bedrock AI分析
async function performBedrockAnalysis(content, filename, modelId, region) {
    console.log('🤖 开始Bedrock AI分析...');
    
    try {
        // 构建分析提示
        const prompt = `你是一个专业的Java性能分析专家。请分析以下线程转储文件，提供详细的诊断报告。

文件名: ${filename}
线程转储内容:
${content.substring(0, 8000)} ${content.length > 8000 ? '...(内容已截断)' : ''}

请提供以下分析：
1. 系统健康评分 (0-100分)
2. 线程状态统计和分析
3. 性能瓶颈识别
4. 死锁检测
5. 具体的优化建议
6. 风险评估

请以JSON格式返回结果。`;

        const requestBody = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 4000,
            "temperature": 0.1,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        };
        
        // 创建临时文件
        const tempFile = path.join(__dirname, `bedrock_response_${Date.now()}.json`);
        
        console.log('📡 调用Bedrock API...');
        const invokeCmd = `AWS_REGION=${region} aws bedrock-runtime invoke-model --model-id ${modelId} --body '${JSON.stringify(requestBody)}' --cli-binary-format raw-in-base64-out ${tempFile}`;
        
        await execAsync(invokeCmd);
        
        // 读取响应
        const responseData = await fs.readFile(tempFile, 'utf8');
        const response = JSON.parse(responseData);
        
        // 清理临时文件
        await fs.unlink(tempFile);
        
        console.log('✅ Bedrock分析完成');
        
        // 解析AI响应
        const aiResponse = response.content[0].text;
        
        // 尝试解析JSON响应，如果失败则使用文本解析
        let analysisResult;
        try {
            analysisResult = JSON.parse(aiResponse);
        } catch (e) {
            // 如果AI没有返回有效JSON，进行文本解析
            analysisResult = parseTextResponse(aiResponse, content);
        }
        
        return {
            success: true,
            analysis: analysisResult,
            rawResponse: aiResponse
        };
        
    } catch (error) {
        console.error('❌ Bedrock分析失败:', error.message);
        
        // 如果Bedrock失败，回退到本地分析
        console.log('🔄 回退到本地分析...');
        const fallbackResult = performLocalAnalysis(content);
        
        return {
            success: false,
            error: error.message,
            fallbackAnalysis: fallbackResult
        };
    }
}

// 解析文本响应
function parseTextResponse(textResponse, content) {
    // 基础统计
    const threadCount = (content.match(/Thread\.State/g) || []).length;
    const runnableCount = (content.match(/RUNNABLE/g) || []).length;
    const blockedCount = (content.match(/BLOCKED/g) || []).length;
    const waitingCount = (content.match(/WAITING/g) || []).length;
    
    // 从AI响应中提取健康评分
    const scoreMatch = textResponse.match(/(\d+)\s*分|score[:\s]*(\d+)|健康评分[:\s]*(\d+)/i);
    const healthScore = scoreMatch ? parseInt(scoreMatch[1] || scoreMatch[2] || scoreMatch[3]) : 75;
    
    return {
        healthScore: Math.min(100, Math.max(0, healthScore)),
        summary: `AI分析完成：检测到 ${threadCount} 个线程，健康评分 ${healthScore} 分`,
        threadStats: {
            total: threadCount,
            runnable: runnableCount,
            blocked: blockedCount,
            waiting: waitingCount,
            timedWaiting: 0
        },
        issues: blockedCount > 0 ? [{
            severity: "medium",
            type: "performance",
            description: `检测到 ${blockedCount} 个阻塞线程`,
            recommendation: "建议检查同步机制和锁竞争问题"
        }] : [],
        recommendations: [
            "基于AI文本分析的建议",
            textResponse.substring(0, 200) + "..."
        ],
        riskAssessment: `基于AI分析，系统风险等级为${healthScore >= 80 ? '低' : healthScore >= 60 ? '中' : '高'}`,
        aiResponse: textResponse
    };
}

// 本地分析（备用方案）
function performLocalAnalysis(content) {
    const threadCount = (content.match(/Thread\.State/g) || []).length;
    const runnableCount = (content.match(/RUNNABLE/g) || []).length;
    const blockedCount = (content.match(/BLOCKED/g) || []).length;
    const waitingCount = (content.match(/WAITING/g) || []).length;
    
    const healthScore = Math.max(50, Math.min(100, 80 - (blockedCount * 10) + (runnableCount * 5)));
    
    return {
        healthScore,
        summary: `本地分析完成：检测到 ${threadCount} 个线程`,
        threadStats: {
            total: threadCount,
            runnable: runnableCount,
            blocked: blockedCount,
            waiting: waitingCount,
            timedWaiting: 0
        },
        issues: [],
        recommendations: ["本地分析模式，建议配置AWS Bedrock获取AI分析"],
        riskAssessment: "本地分析模式"
    };
}

// 启动服务
app.listen(PORT, () => {
    console.log(`🎉 AWS Bedrock服务已启动`);
    console.log(`📡 服务地址: http://localhost:${PORT}`);
    console.log(`🌍 AWS区域: ${process.env.AWS_REGION}`);
    console.log('');
    console.log('可用接口:');
    console.log(`  POST /api/test-connection - 测试AWS连接`);
    console.log(`  POST /api/analyze - AI分析`);
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n🛑 正在关闭服务...');
    process.exit(0);
});

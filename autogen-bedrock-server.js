#!/usr/bin/env node

// 基于AutoGen框架的AWS Bedrock连接服务
const express = require('express');
const cors = require('cors');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { BedrockClient, ListFoundationModelsCommand } = require('@aws-sdk/client-bedrock');

const app = express();
const PORT = 8082;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' })); // 增加payload限制到10MB
app.use(express.urlencoded({ limit: '10mb', extended: true })); // 也增加form数据限制

console.log('🚀 启动AutoGen Bedrock服务...');

// AutoGen风格的Bedrock客户端配置
class AutoGenBedrockClient {
    constructor(config) {
        this.config = config;
        this.bedrockClient = new BedrockClient({
            region: config.region,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
                sessionToken: config.sessionToken
            }
        });
        
        this.bedrockRuntimeClient = new BedrockRuntimeClient({
            region: config.region,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
                sessionToken: config.sessionToken
            }
        });
    }

    // 获取可用模型列表
    async listModels() {
        try {
            const command = new ListFoundationModelsCommand({});
            const response = await this.bedrockClient.send(command);
            return response.modelSummaries;
        } catch (error) {
            throw new Error(`获取模型列表失败: ${error.message}`);
        }
    }

    // AutoGen风格的模型调用
    async invokeModel(modelId, messages, config = {}) {
        try {
            let body;
            let command;
            let actualModelId = modelId;
            
            // 支持直接传递us.前缀的模型ID
            if (modelId.startsWith('us.')) {
                console.log('📌 检测到以us.开头的模型ID:', modelId);
                // 使用完整ID，这是推理配置文件ID
                
                // 跳过不兼容的opus相关模型
                if (modelId.includes('opus')) {
                    console.log('⚠️ 检测到不兼容的opus模型，正在切换到Claude 3.5 Sonnet');
                    actualModelId = 'us.anthropic.claude-3-5-sonnet-20241022-v2:0';
                }
            } 
            // 所有Claude模型都使用推理配置文件格式
            else if (modelId.includes('claude')) {
                console.log('🔄 检测到Claude模型，需要使用ARN格式:', modelId);
                
                // 处理方式：
                // 1. 如果提供了推理配置文件ID，使用该配置文件
                // 2. 如果模型ID已经包含anthropic.前缀，添加us.
                // 3. 否则，添加us.前缀
                
                // 检查是否指定了opus相关模型（不兼容）
                if (modelId.includes('opus')) {
                    console.log('⚠️ 检测到不兼容的opus模型，正在切换到Claude 3.5 Sonnet');
                    actualModelId = 'us.anthropic.claude-3-5-sonnet-20241022-v2:0';
                }
                // 检查是否指定了推理配置文件ID
                else if (config.inferenceProfile) {
                    actualModelId = config.inferenceProfile;
                    console.log('👉 使用用户提供的推理配置文件ID:', actualModelId);
                } else if (modelId.startsWith('arn:')) {
                    // 完整ARN，直接使用
                    actualModelId = modelId;
                    console.log('👉 使用完整推理配置文件ARN:', actualModelId);
                } else if (modelId.startsWith('anthropic.')) {
                    // 添加us.前缀到已有的anthropic.前缀的模型ID
                    actualModelId = 'us.' + modelId;
                    console.log('👉 将anthropic.前缀转换为us.anthropic.格式:', actualModelId);
                } else {
                    // 添加us.前缀
                    actualModelId = 'us.' + modelId;
                    console.log('👉 添加us.前缀生成推理配置文件ID:', actualModelId);
                }
            }
            
            // 根据模型类型构建请求体
            if (modelId.includes('anthropic.claude') || modelId.includes('us.anthropic.claude')) {
                // 检查消息格式并转换为Claude所需的格式
                let claudeMessages = [];
                
                if (messages.length > 0 && messages.some(m => m.role === 'system' || m.role === 'user')) {
                    // 如果消息中有system角色，需要转换格式
                    let systemContent = '';
                    let userContent = '';
                    
                    // 提取system内容
                    const systemMsg = messages.find(m => m.role === 'system');
                    if (systemMsg) {
                        systemContent = systemMsg.content;
                    }
                    
                    // 提取user内容
                    const userMsg = messages.find(m => m.role === 'user');
                    if (userMsg) {
                        userContent = userMsg.content;
                    }
                    
                    // 合并内容
                    if (systemContent && userContent) {
                        claudeMessages = [
                            { role: 'user', content: systemContent + '\n\n' + userContent }
                        ];
                    } else if (userContent) {
                        claudeMessages = [
                            { role: 'user', content: userContent }
                        ];
                    } else if (systemContent) {
                        claudeMessages = [
                            { role: 'user', content: systemContent }
                        ];
                    } else {
                        claudeMessages = messages;
                    }
                } else {
                    // 消息格式已经符合要求
                    claudeMessages = messages;
                }
                
                // Claude模型的请求体格式
                body = {
                    anthropic_version: "bedrock-2023-05-31",
                    max_tokens: config.maxTokens || 4000,
                    temperature: config.temperature || 0.1,
                    top_p: config.topP || 0.9,
                    messages: claudeMessages
                };
                
                // 使用推理配置文件调用Claude模型
                const inferenceProfileArn = actualModelId;
                console.log('📌 使用推理配置文件调用Claude:', inferenceProfileArn);
                console.log('🔍 调用配置详情:', JSON.stringify({useInferenceProfile: true, ARN: inferenceProfileArn, originalModelId: modelId}));
                
                command = new InvokeModelCommand({
                    modelId: actualModelId, // 对于推理配置文件，使用完整ARN作为modelId
                    body: JSON.stringify(body),
                    contentType: 'application/json',
                    accept: 'application/json'
                });
                
                console.log('📤 调用Claude模型:', actualModelId, '(原始模型ID:', modelId + ')');
            } else if (modelId.includes('amazon.titan') || modelId.includes('us.amazon.titan')) {
                body = {
                    inputText: messages[0]?.content || "",
                    textGenerationConfig: {
                        maxTokenCount: config.maxTokens || 4000,
                        temperature: config.temperature || 0.1,
                        topP: config.topP || 0.9
                    }
                };
                
                command = new InvokeModelCommand({
                    modelId: actualModelId,
                    body: JSON.stringify(body),
                    contentType: 'application/json',
                    accept: 'application/json'
                });
                
                console.log('📤 调用Titan模型:', actualModelId);
            } else if (modelId.includes('meta.llama') || modelId.includes('us.meta.llama')) {
                body = {
                    prompt: messages[0]?.content || "",
                    max_gen_len: config.maxTokens || 4000,
                    temperature: config.temperature || 0.1,
                    top_p: config.topP || 0.9
                };
                
                command = new InvokeModelCommand({
                    modelId: actualModelId,
                    body: JSON.stringify(body),
                    contentType: 'application/json',
                    accept: 'application/json'
                });
                
                console.log('📤 调用Llama模型:', actualModelId);
            } else if (modelId.includes('mistral') || modelId.includes('us.mistral')) {
                body = {
                    prompt: messages[0]?.content || "",
                    max_tokens: config.maxTokens || 4000,
                    temperature: config.temperature || 0.1,
                    top_p: config.topP || 0.9
                };
                
                command = new InvokeModelCommand({
                    modelId: actualModelId,
                    body: JSON.stringify(body),
                    contentType: 'application/json',
                    accept: 'application/json'
                });
                
                console.log('📤 调用Mistral模型:', actualModelId);
            } else {
                // 默认格式
                body = {
                    prompt: messages[0]?.content || "",
                    max_tokens: config.maxTokens || 4000,
                    temperature: config.temperature || 0.1
                };
                
                command = new InvokeModelCommand({
                    modelId: actualModelId, // 使用处理后的模型ID
                    body: JSON.stringify(body),
                    contentType: 'application/json',
                    accept: 'application/json'
                });
                
                console.log('📤 调用默认格式模型:', actualModelId);
            }

            const response = await this.bedrockRuntimeClient.send(command);
            const responseBody = JSON.parse(new TextDecoder().decode(response.body));
            
            return this.parseResponse(modelId, responseBody);
            
        } catch (error) {
            throw new Error(`模型调用失败: ${error.message}`);
        }
    }

    // 解析不同模型的响应格式
    parseResponse(modelId, responseBody) {
        // 支持带us.前缀和不带前缀的Claude模型
        if (modelId.includes('anthropic.claude') || modelId.includes('us.anthropic.claude')) {
            // 处理新旧Claude模型的不同响应格式
            if (responseBody.content && Array.isArray(responseBody.content)) {
                // Claude 3.5/3.7及更新的模型使用这种格式
                return {
                    content: responseBody.content[0]?.text || '',
                    usage: responseBody.usage || {}
                };
            } else {
                // 旧版Claude模型使用这种格式
                return {
                    content: responseBody.completion || '',
                    usage: responseBody.usage || {}
                };
            }
        } else if (modelId.includes('amazon.titan')) {
            return {
                content: responseBody.results?.[0]?.outputText || '',
                usage: responseBody.inputTextTokenCount ? {
                    input_tokens: responseBody.inputTextTokenCount,
                    output_tokens: responseBody.results?.[0]?.tokenCount || 0
                } : {}
            };
        } else if (modelId.includes('meta.llama')) {
            return {
                content: responseBody.generation || '',
                usage: {}
            };
        } else if (modelId.includes('mistral')) {
            return {
                content: responseBody.outputs?.[0]?.text || '',
                usage: {}
            };
        } else {
            return {
                content: responseBody.completion || responseBody.text || JSON.stringify(responseBody),
                usage: {}
            };
        }
    }

    // 测试连接
    async testConnection(preferredModelId = null) {
        console.log('🔍 测试连接使用首选模型:', preferredModelId || '未指定（将使用默认模型）');
        const results = {
            success: false,
            steps: [],
            details: {}
        };

        try {
            // 1. 测试凭证
            results.steps.push({ step: 'credentials', status: 'testing', message: '验证AWS凭证...' });
            
            const models = await this.listModels();
            results.steps[0].status = 'success';
            results.steps[0].message = '✅ AWS凭证验证成功';
            
            // 2. 检查模型可用性
            results.steps.push({ step: 'models', status: 'testing', message: '检查模型可用性...' });
            
            // 筛选出 Claude 模型，并跳过不兼容的 opus4 模型
            // 过滤出所有Claude模型用于显示
            const allClaudeModels = models.filter(m => {
                const modelId = m.modelId;
                return (m.provider === 'Anthropic' || modelId.includes('anthropic')) && modelId.includes('claude');
            });
            
            console.log('🔍 找到所有Claude模型:', allClaudeModels.map(m => m.modelId).join(', '));
            
            // 过滤出兼容的Claude模型（排除所有opus系列）
            const claudeModels = allClaudeModels.filter(m => {
                const modelId = m.modelId;
                // 跳过所有opus模型（包括 opus-4、opus4 和普通opus）
                if (modelId.includes('opus')) {
                    console.log('⚠️ 跳过不兼容的 opus 模型:', modelId);
                    return false;
                }
                return true;
            });
            
            console.log('👍 选择兼容的Claude模型:', claudeModels.map(m => m.modelId).join(', '));
            
            if (claudeModels.length === 0) {
                throw new Error('当前区域没有可用的Claude模型');
            }
            
            results.steps[1].status = 'success';
            results.steps[1].message = `✅ 找到 ${claudeModels.length} 个Claude模型`;
            
            // 3. 测试模型调用
            results.steps.push({ step: 'invoke', status: 'testing', message: '测试模型调用...' });
            
            // 选择测试模型并确保使用ARN格式
            let testModel;
            let userRequestedModel = null; // 记录用户原始请求的模型
            let reasonForModelChange = null; // 如果需要更改模型，记录原因
            
            // 如果用户指定了首选模型则优先使用用户选择的模型
            if (preferredModelId) {
                console.log('👍 使用用户指定的模型进行测试:', preferredModelId);
                userRequestedModel = preferredModelId;
                
                // 检查指定的模型是否是opus系列
                if (preferredModelId.includes('opus')) {
                    reasonForModelChange = '用户选择的是opus系列模型，该系列需要特殊配置才能使用，已自动更换为兼容模型';
                    console.log('⚠️ 用户指定的模型是opus系列，不推荐使用。将选择兼容模型进行测试');
                    testModel = claudeModels[0].modelId;
                } else {
                    testModel = preferredModelId;
                }
            } else {
                // 如果用户没有指定模型则选择第一个可用模型
                testModel = claudeModels[0].modelId;
                console.log('ℹ️ 用户未指定模型，使用默认模型:', testModel);
            }
            
            // 确保模型 ID 使用正确格式
            if (!testModel.startsWith('arn:') && !testModel.startsWith('us.') && testModel.includes('claude')) {
                // 只有普通模型ID才添加us.前缀，ARN不需要处理
                testModel = 'us.' + testModel;
                console.log('🔄 转换测试模型为 ARN 格式:', testModel);
            } else if (testModel.startsWith('arn:')) {
                console.log('✅ 使用完整推理配置文件ARN:', testModel);
            }
            
            console.log('💡 最终选定的测试模型:', testModel);
            const testMessages = [{
                role: 'user',
                content: '请回复"连接测试成功"确认你能正常工作。'
            }];
            
            // 使用推理配置文件调用模型，特别指定使用inferenceProfileArn
            const response = await this.invokeModel(testModel, testMessages, {
                maxTokens: 100,
                temperature: 0.1,
                inferenceProfile: testModel // 使用当前模型的ARN作为推理配置文件
            });
            
            results.steps[2].status = 'success';
            results.steps[2].message = '✅ 模型调用成功';
            
            results.success = true;
            results.details = {
                region: this.config.region,
                availableModels: claudeModels.length,
                testModel: testModel,
                userRequestedModel: userRequestedModel,
                modelChangeReason: reasonForModelChange,
                testResponse: response.content,
                modelList: claudeModels.map(m => ({
                    id: m.modelId,
                    name: m.modelName,
                    provider: m.providerName
                }))
            };
            
        } catch (error) {
            const currentStep = results.steps.find(s => s.status === 'testing');
            if (currentStep) {
                currentStep.status = 'error';
                currentStep.message = `❌ ${error.message}`;
            }
            
            results.success = false;
            results.error = error.message;
        }

        return results;
    }
}

// 连接测试接口
app.post('/api/test-autogen-bedrock', async (req, res) => {
    const { accessKey, secretKey, sessionToken, region, modelId, inferenceProfileArn } = req.body;
    
    // 优先使用 inferenceProfileArn，如果没有则使用 modelId
    const effectiveModelId = inferenceProfileArn || modelId;
    
    console.log(`🧪 AutoGen Bedrock连接测试 - 区域: ${region}, 模型: ${effectiveModelId}`);
    
    try {
        const client = new AutoGenBedrockClient({
            accessKeyId: accessKey,
            secretAccessKey: secretKey,
            sessionToken: sessionToken,
            region: region
        });
        
        // 传递用户指定的模型到测试方法
        const result = await client.testConnection(effectiveModelId);
        
        if (result.success) {
            console.log('✅ AutoGen Bedrock连接测试成功');
        } else {
            console.log('❌ AutoGen Bedrock连接测试失败:', result.error);
        }
        
        res.json(result);
        
    } catch (error) {
        console.error('❌ AutoGen Bedrock测试异常:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            steps: [
                { step: 'setup', status: 'error', message: `❌ 服务初始化失败: ${error.message}` }
            ]
        });
    }
});

// 模型调用接口
app.post('/api/invoke-autogen-bedrock', async (req, res) => {
    const { accessKey, secretKey, sessionToken, region, modelId, inferenceProfileArn, messages, config } = req.body;
    
    // 优先使用inferenceProfileArn，如果没有则使用modelId
    const effectiveModelId = inferenceProfileArn || modelId;
    
    console.log('📝 接收到模型调用请求', { 
        region, 
        modelId: modelId || 'not_provided', 
        inferenceProfileArn: inferenceProfileArn || 'not_provided',
        effectiveModelId,
        messagesCount: messages?.length || 0
    });
    
    try {
        const client = new AutoGenBedrockClient({
            accessKeyId: accessKey,
            secretAccessKey: secretKey,
            sessionToken: sessionToken,
            region: region
        });
        
        const response = await client.invokeModel(effectiveModelId, messages, config);
        
        console.log('✅ AutoGen模型调用成功，响应长度:', response.content?.length || 0);
        console.log('📄 响应内容预览:', response.content?.substring(0, 200) + '...');
        
        res.json({
            success: true,
            response: response
        });
        
    } catch (error) {
        console.error('❌ AutoGen模型调用失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 获取可用模型列表
app.post('/api/list-autogen-models', async (req, res) => {
    const { accessKey, secretKey, sessionToken, region } = req.body;
    
    try {
        const client = new AutoGenBedrockClient({
            accessKeyId: accessKey,
            secretAccessKey: secretKey,
            sessionToken: sessionToken,
            region: region
        });
        
        const models = await client.listModels();
        
        res.json({
            success: true,
            models: models.map(m => ({
                id: m.modelId,
                name: m.modelName,
                provider: m.providerName,
                inputModalities: m.inputModalities,
                outputModalities: m.outputModalities
            }))
        });
        
    } catch (error) {
        console.error('❌ 获取模型列表失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 健康检查
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'autogen-bedrock-server',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// 启动服务
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ AutoGen Bedrock服务已启动`);
    console.log(`🌐 服务地址: http://0.0.0.0:${PORT}`);
    console.log(`🔍 健康检查: http://localhost:${PORT}/health`);
    console.log(`📋 API端点:`);
    console.log(`   POST /api/test-autogen-bedrock - 连接测试`);
    console.log(`   POST /api/invoke-autogen-bedrock - 模型调用`);
    console.log(`   POST /api/list-autogen-models - 获取模型列表`);
});

module.exports = { AutoGenBedrockClient };

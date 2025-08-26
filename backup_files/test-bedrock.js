const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
const { BedrockClient, ListFoundationModelsCommand } = require("@aws-sdk/client-bedrock");

const config = {
    region: "us-west-2",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "AKIAEXAMPLEKEYID1234",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "exampleSecretKey123456789abcdefghijklmnop"
    }
};

async function testBedrock() {
    try {
        console.log("🔍 测试Bedrock连接...");
        
        // 1. 测试基础连接
        const bedrockClient = new BedrockClient(config);
        const listCommand = new ListFoundationModelsCommand({});
        const models = await bedrockClient.send(listCommand);
        
        console.log("✅ 基础连接成功");
        console.log(`📋 找到 ${models.modelSummaries.length} 个基础模型`);
        
        // 2. 筛选Claude模型
        const claudeModels = models.modelSummaries.filter(m => 
            m.modelId.includes('claude') && !m.modelId.includes('opus')
        );
        
        console.log(`🤖 可用Claude模型:`);
        claudeModels.forEach(m => {
            console.log(`   - ${m.modelId} (${m.modelName})`);
        });
        
        // 3. 测试推理配置文件
        const runtimeClient = new BedrockRuntimeClient(config);
        const inferenceProfileArn = "arn:aws:bedrock:us-west-2:590183689329:inference-profile/myAppProfile";
        
        console.log("\n🔧 测试推理配置文件...");
        
        const invokeCommand = new InvokeModelCommand({
            modelId: inferenceProfileArn,
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify({
                anthropic_version: "bedrock-2023-05-31",
                max_tokens: 100,
                messages: [{
                    role: "user",
                    content: "Hello, test message"
                }]
            })
        });
        
        const response = await runtimeClient.send(invokeCommand);
        const result = JSON.parse(new TextDecoder().decode(response.body));
        
        console.log("✅ 推理配置文件测试成功!");
        console.log("📝 响应:", result.content[0].text);
        
    } catch (error) {
        console.error("❌ 测试失败:", error.message);
        if (error.$metadata) {
            console.error("📊 错误详情:", error.$metadata);
        }
    }
}

testBedrock();
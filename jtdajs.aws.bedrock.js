/*
AWS Bedrock Claude Integration for Java Thread Dump Analyzer
Copyright 2025 - Real AI Integration with AWS Bedrock
*/

var jtda = jtda || {};
(function() {
    "use strict";

    jtda.aws = jtda.aws || {};
    jtda.aws.bedrock = jtda.aws.bedrock || {};

    // AWS Bedrock 配置
    jtda.aws.bedrock.Config = function() {
        this.region = 'us-east-1'; // 默认区域
        this.accessKeyId = '';
        this.secretAccessKey = '';
        this.sessionToken = ''; // 可选，用于临时凭证
        this.modelId = 'anthropic.claude-3-5-sonnet-20241022-v2:0'; // Claude 3.5 Sonnet
        this.maxTokens = 4000;
        this.temperature = 0.1;
        this.enabled = false;
    };

    // AWS Bedrock 客户端
    jtda.aws.bedrock.Client = function(config) {
        this.config = config || new jtda.aws.bedrock.Config();
        
        // 检查配置是否完整
        this.isConfigured = function() {
            return this.config.accessKeyId && 
                   this.config.secretAccessKey && 
                   this.config.region;
        };

        // 调用 AWS Bedrock API
        this.invokeModel = function(prompt, callback) {
            if (!this.isConfigured()) {
                callback(new Error('AWS Bedrock 配置不完整'), null);
                return;
            }

            var requestBody = {
                anthropic_version: "bedrock-2023-05-31",
                max_tokens: this.config.maxTokens,
                temperature: this.config.temperature,
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            };

            // 构建 AWS API 请求
            this._makeBedrockRequest(requestBody, callback);
        };

        // 构建 AWS Bedrock 请求
        this._makeBedrockRequest = function(requestBody, callback) {
            var endpoint = `https://bedrock-runtime.${this.config.region}.amazonaws.com/model/${this.config.modelId}/invoke`;
            
            // 由于浏览器的 CORS 限制，我们需要通过后端代理
            // 这里先实现一个简化版本，实际部署时需要后端支持
            this._callViaProxy(endpoint, requestBody, callback);
        };

        // 通过代理调用（需要后端支持）
        this._callViaProxy = function(endpoint, requestBody, callback) {
            // 检查是否有后端代理
            $.ajax({
                url: '/api/bedrock-proxy',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    endpoint: endpoint,
                    body: requestBody,
                    config: {
                        region: this.config.region,
                        accessKeyId: this.config.accessKeyId,
                        secretAccessKey: this.config.secretAccessKey,
                        sessionToken: this.config.sessionToken
                    }
                }),
                timeout: 30000,
                success: function(response) {
                    try {
                        var result = typeof response === 'string' ? JSON.parse(response) : response;
                        callback(null, result);
                    } catch (e) {
                        callback(new Error('解析响应失败: ' + e.message), null);
                    }
                },
                error: function(xhr, status, error) {
                    if (xhr.status === 404) {
                        // 后端代理不可用，使用模拟模式
                        console.warn('后端代理不可用，使用模拟 AI 分析');
                        callback(new Error('PROXY_NOT_AVAILABLE'), null);
                    } else {
                        callback(new Error(`AWS Bedrock 调用失败: ${error}`), null);
                    }
                }
            });
        };

        // 生成分析提示词
        this.generateAnalysisPrompt = function(analysisData) {
            return `你是一个专业的 Java 性能分析专家。请分析以下线程转储数据并提供详细的诊断报告。

## 线程转储数据摘要：
- 总线程数: ${analysisData.threadSummary.totalThreads}
- 线程状态分布: ${JSON.stringify(analysisData.threadSummary.statusDistribution, null, 2)}
- 死锁数量: ${analysisData.deadlocks.length}
- 同步器数量: ${analysisData.synchronizers.totalSynchronizers || 0}
- 争用同步器数量: ${analysisData.synchronizers.contendedSynchronizers || 0}

## 热点方法（按线程数排序）：
${analysisData.threadSummary.topStackTraces.map(item => `- ${item.method}: ${item.count} 个线程`).join('\n')}

请提供以下格式的 JSON 响应：

{
  "summary": {
    "overallHealth": {
      "score": 85,
      "level": "good",
      "issues": ["具体问题描述"]
    },
    "criticalIssues": [
      {
        "type": "deadlock|contention|performance",
        "severity": "critical|warning|info",
        "title": "问题标题",
        "description": "详细描述",
        "recommendation": "解决建议"
      }
    ],
    "performanceScore": {
      "score": 80,
      "factors": ["影响因素"]
    }
  },
  "insights": {
    "threadAnalysis": {
      "patterns": [
        {
          "name": "模式名称",
          "detected": true,
          "description": "模式描述",
          "recommendation": "建议"
        }
      ],
      "anomalies": ["异常情况"]
    },
    "resourceContention": {
      "hotspots": [
        {"method": "方法名", "count": 数量}
      ],
      "contentionLevel": "low|moderate|high",
      "suggestions": ["优化建议"]
    },
    "recommendations": [
      {
        "category": "threading|synchronization|performance",
        "priority": "high|medium|low",
        "title": "建议标题",
        "description": "详细描述",
        "actions": ["具体操作步骤"]
      }
    ]
  }
}

请确保响应是有效的 JSON 格式，并且包含具体、可操作的建议。`;
        };
    };

    // AI 分析器（使用真实的 AWS Bedrock）
    jtda.aws.bedrock.Analyzer = function(config) {
        this.client = new jtda.aws.bedrock.Client(config);
        
        // 主要 AI 分析方法
        this.analyzeWithAI = function(analysis, callback) {
            if (!this.client.isConfigured()) {
                callback(new Error('AWS Bedrock 未配置'), null);
                return;
            }

            var aiInput = this._prepareAIInput(analysis);
            var prompt = this.client.generateAnalysisPrompt(aiInput);
            
            this.client.invokeModel(prompt, function(error, response) {
                if (error) {
                    if (error.message === 'PROXY_NOT_AVAILABLE') {
                        // 回退到模拟模式
                        var mockAnalyzer = new jtda.ai.Analyzer();
                        mockAnalyzer.analyzeWithAI(analysis, callback);
                        return;
                    }
                    callback(error, null);
                    return;
                }
                
                try {
                    // 解析 Claude 的响应
                    var aiResult = this._parseClaudeResponse(response);
                    var enhancedAnalysis = this._enhanceAnalysisWithAI(analysis, aiResult);
                    callback(null, enhancedAnalysis);
                } catch (e) {
                    console.error('解析 AI 响应失败:', e);
                    callback(new Error('AI 响应解析失败'), null);
                }
            }.bind(this));
        };

        // 准备 AI 输入数据
        this._prepareAIInput = function(analysis) {
            return {
                metadata: {
                    threadCount: analysis.threads.length,
                    date: analysis.dateString,
                    hasDeadlocks: analysis.deadlocks && analysis.deadlocks.length > 0
                },
                threadSummary: this._getThreadSummary(analysis),
                synchronizers: this._getSynchronizerSummary(analysis),
                deadlocks: analysis.deadlocks || [],
                runningMethods: analysis.runningMethods || {}
            };
        };

        // 获取线程摘要
        this._getThreadSummary = function(analysis) {
            var statusCounts = {};
            
            analysis.threads.forEach(function(thread) {
                var status = thread.getStatus();
                statusCounts[status] = (statusCounts[status] || 0) + 1;
            });

            return {
                totalThreads: analysis.threads.length,
                statusDistribution: statusCounts,
                topStackTraces: this._getTopStackTraces(analysis.threads)
            };
        };

        // 获取同步器摘要
        this._getSynchronizerSummary = function(analysis) {
            if (!analysis.synchronizers) return {};
            
            return {
                totalSynchronizers: analysis.synchronizers.length,
                contendedSynchronizers: analysis.synchronizers.filter(function(sync) {
                    return sync.waitingThreads && sync.waitingThreads.length > 1;
                }).length
            };
        };

        // 获取热点堆栈跟踪
        this._getTopStackTraces = function(threads) {
            var stackCounts = {};
            
            threads.forEach(function(thread) {
                if (thread.stackTrace && thread.stackTrace.length > 0) {
                    var topFrame = thread.stackTrace[0];
                    var key = topFrame.className + '.' + topFrame.methodName;
                    stackCounts[key] = (stackCounts[key] || 0) + 1;
                }
            });

            return Object.keys(stackCounts)
                .sort(function(a, b) { return stackCounts[b] - stackCounts[a]; })
                .slice(0, 10)
                .map(function(key) {
                    return { method: key, count: stackCounts[key] };
                });
        };

        // 解析 Claude 响应
        this._parseClaudeResponse = function(response) {
            // AWS Bedrock 响应格式
            if (response.content && response.content[0] && response.content[0].text) {
                var text = response.content[0].text;
                // 尝试提取 JSON
                var jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
            }
            throw new Error('无法解析 Claude 响应');
        };

        // 用 AI 结果增强原始分析
        this._enhanceAnalysisWithAI = function(analysis, aiResult) {
            analysis.aiEnhanced = true;
            analysis.aiInsights = aiResult;
            analysis.aiProvider = 'AWS Bedrock Claude 3.5 Sonnet';
            return analysis;
        };
    };

})();

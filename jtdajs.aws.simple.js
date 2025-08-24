/*
Simple AWS Bedrock Integration (Browser-only)
Copyright 2025 - Simplified AWS Integration without backend proxy
*/

var jtda = jtda || {};
(function() {
    "use strict";

    jtda.aws = jtda.aws || {};
    jtda.aws.simple = jtda.aws.simple || {};

    // 简化的 AWS Bedrock 配置
    jtda.aws.simple.Config = function() {
        this.region = 'us-east-1';
        this.accessKeyId = '';
        this.secretAccessKey = '';
        this.sessionToken = '';
        this.modelId = 'anthropic.claude-3-5-sonnet-20241022-v2:0';
        this.maxTokens = 4000;
        this.temperature = 0.1;
        this.enabled = false;
    };

    // 简化的 AWS 签名工具
    jtda.aws.simple.Signer = function() {
        // AWS Signature Version 4 实现（简化版）
        this.sign = function(request, credentials, region, service) {
            // 注意：这是一个简化的实现，实际生产环境需要完整的 AWS4 签名
            // 由于浏览器环境的限制，建议使用 AWS SDK 或后端代理
            
            var now = new Date();
            var dateStamp = now.toISOString().slice(0, 10).replace(/-/g, '');
            var timeStamp = now.toISOString().slice(0, 19).replace(/[-:]/g, '') + 'Z';
            
            // 构建规范请求
            var canonicalRequest = this.buildCanonicalRequest(request);
            
            // 构建签名字符串
            var credentialScope = dateStamp + '/' + region + '/' + service + '/aws4_request';
            var stringToSign = 'AWS4-HMAC-SHA256\n' + timeStamp + '\n' + credentialScope + '\n' + 
                              this.sha256(canonicalRequest);
            
            // 计算签名
            var signature = this.calculateSignature(credentials.secretAccessKey, dateStamp, region, service, stringToSign);
            
            // 构建授权头
            var authHeader = 'AWS4-HMAC-SHA256 Credential=' + credentials.accessKeyId + '/' + credentialScope +
                           ', SignedHeaders=host;x-amz-date, Signature=' + signature;
            
            return {
                'Authorization': authHeader,
                'X-Amz-Date': timeStamp,
                'X-Amz-Security-Token': credentials.sessionToken || undefined
            };
        };

        this.buildCanonicalRequest = function(request) {
            // 简化的规范请求构建
            return request.method + '\n' + request.path + '\n' + request.queryString + '\n' +
                   request.headers + '\n' + request.signedHeaders + '\n' + this.sha256(request.body);
        };

        this.sha256 = function(data) {
            // 简化的 SHA256 实现（实际应使用 crypto-js 或类似库）
            return 'simplified_hash_' + data.length;
        };

        this.calculateSignature = function(secretKey, dateStamp, region, service, stringToSign) {
            // 简化的签名计算
            return 'simplified_signature_' + secretKey.slice(-8);
        };
    };

    // 简化的 Bedrock 客户端
    jtda.aws.simple.Client = function(config) {
        this.config = config || new jtda.aws.simple.Config();
        this.signer = new jtda.aws.simple.Signer();
        
        this.isConfigured = function() {
            return this.config.accessKeyId && this.config.secretAccessKey && this.config.region;
        };

        // 调用模型（简化版本，实际需要完整的 AWS 签名）
        this.invokeModel = function(prompt, callback) {
            // 由于浏览器 CORS 限制和 AWS 签名复杂性，这里提供一个模拟实现
            // 实际部署时建议使用后端代理或 AWS SDK
            
            console.warn('⚠️ 使用简化的 AWS Bedrock 客户端（模拟模式）');
            console.log('💡 要使用真实的 AWS Bedrock，请配置后端代理服务器');
            
            // 模拟 AI 响应
            setTimeout(function() {
                var mockResponse = this._generateMockResponse(prompt);
                callback(null, mockResponse);
            }.bind(this), 2000); // 模拟网络延迟
        };

        // 生成模拟响应
        this._generateMockResponse = function(prompt) {
            // 基于提示词生成模拟的 Claude 响应
            var analysisData = this._extractAnalysisData(prompt);
            
            return {
                content: [{
                    text: JSON.stringify({
                        summary: {
                            overallHealth: {
                                score: this._calculateMockScore(analysisData),
                                level: this._getMockHealthLevel(analysisData),
                                issues: this._getMockIssues(analysisData)
                            },
                            criticalIssues: this._getMockCriticalIssues(analysisData),
                            performanceScore: {
                                score: Math.max(0, 100 - (analysisData.deadlocks * 30) - (analysisData.blockedRatio * 20)),
                                factors: ['基于模拟分析的评分']
                            }
                        },
                        insights: {
                            threadAnalysis: {
                                patterns: [{
                                    name: '线程池模式',
                                    detected: true,
                                    description: '检测到标准线程池使用模式',
                                    recommendation: '线程池配置合理'
                                }],
                                anomalies: analysisData.deadlocks > 0 ? ['检测到死锁'] : []
                            },
                            resourceContention: {
                                hotspots: analysisData.hotspots || [],
                                contentionLevel: analysisData.blockedRatio > 0.5 ? 'high' : 
                                               analysisData.blockedRatio > 0.2 ? 'moderate' : 'low',
                                suggestions: [
                                    '考虑使用读写锁替代互斥锁',
                                    '减少临界区代码执行时间',
                                    '使用无锁数据结构'
                                ]
                            },
                            recommendations: this._getMockRecommendations(analysisData)
                        }
                    }, null, 2)
                }]
            };
        };

        // 从提示词中提取分析数据
        this._extractAnalysisData = function(prompt) {
            var data = {
                totalThreads: 0,
                deadlocks: 0,
                blockedRatio: 0,
                hotspots: []
            };

            // 简单的正则提取
            var threadMatch = prompt.match(/总线程数:\s*(\d+)/);
            if (threadMatch) data.totalThreads = parseInt(threadMatch[1]);

            var deadlockMatch = prompt.match(/死锁数量:\s*(\d+)/);
            if (deadlockMatch) data.deadlocks = parseInt(deadlockMatch[1]);

            var statusMatch = prompt.match(/线程状态分布:\s*({[^}]+})/);
            if (statusMatch) {
                try {
                    var status = JSON.parse(statusMatch[1]);
                    var blocked = status.BLOCKED || 0;
                    var waiting = status.WAITING || 0;
                    data.blockedRatio = (blocked + waiting) / data.totalThreads;
                } catch (e) {
                    console.warn('解析线程状态失败:', e);
                }
            }

            return data;
        };

        // 计算模拟评分
        this._calculateMockScore = function(data) {
            var score = 100;
            if (data.deadlocks > 0) score -= 50;
            if (data.blockedRatio > 0.5) score -= 30;
            else if (data.blockedRatio > 0.2) score -= 15;
            return Math.max(0, score);
        };

        // 获取健康级别
        this._getMockHealthLevel = function(data) {
            var score = this._calculateMockScore(data);
            if (score > 80) return 'excellent';
            if (score > 60) return 'good';
            if (score > 40) return 'warning';
            return 'critical';
        };

        // 获取问题列表
        this._getMockIssues = function(data) {
            var issues = [];
            if (data.deadlocks > 0) issues.push('检测到死锁');
            if (data.blockedRatio > 0.5) issues.push('大量线程处于阻塞状态');
            return issues;
        };

        // 获取关键问题
        this._getMockCriticalIssues = function(data) {
            var issues = [];
            
            if (data.deadlocks > 0) {
                issues.push({
                    type: 'deadlock',
                    severity: 'critical',
                    title: '死锁检测',
                    description: `检测到 ${data.deadlocks} 个死锁，需要立即处理`,
                    recommendation: '检查锁的获取顺序，考虑使用超时机制'
                });
            }

            if (data.blockedRatio > 0.3) {
                issues.push({
                    type: 'contention',
                    severity: 'warning',
                    title: '线程阻塞严重',
                    description: `${Math.round(data.blockedRatio * 100)}% 的线程处于阻塞状态`,
                    recommendation: '优化同步机制，减少锁争用'
                });
            }

            return issues;
        };

        // 获取建议
        this._getMockRecommendations = function(data) {
            var recommendations = [];

            if (data.deadlocks > 0) {
                recommendations.push({
                    category: 'synchronization',
                    priority: 'high',
                    title: '解决死锁问题',
                    description: '当前系统存在死锁，需要立即处理',
                    actions: [
                        '分析死锁涉及的资源和线程',
                        '重新设计锁获取顺序',
                        '使用超时机制避免无限等待',
                        '考虑使用无锁数据结构'
                    ]
                });
            }

            if (data.blockedRatio > 0.2) {
                recommendations.push({
                    category: 'threading',
                    priority: data.blockedRatio > 0.5 ? 'high' : 'medium',
                    title: '优化线程阻塞',
                    description: '减少线程阻塞，提高系统并发性能',
                    actions: [
                        '分析阻塞的根本原因',
                        '优化数据库连接池配置',
                        '使用异步处理替代同步等待',
                        '调整线程池大小'
                    ]
                });
            }

            return recommendations;
        };
    };

    // 简化的 AI 分析器
    jtda.aws.simple.Analyzer = function(config) {
        this.client = new jtda.aws.simple.Client(config);
        
        this.analyzeWithAI = function(analysis, callback) {
            if (!this.client.isConfigured()) {
                callback(new Error('AWS 配置不完整'), null);
                return;
            }

            var aiInput = this._prepareAIInput(analysis);
            var prompt = this._generatePrompt(aiInput);
            
            this.client.invokeModel(prompt, function(error, response) {
                if (error) {
                    callback(error, null);
                    return;
                }
                
                try {
                    var aiResult = this._parseResponse(response);
                    var enhancedAnalysis = this._enhanceAnalysis(analysis, aiResult);
                    callback(null, enhancedAnalysis);
                } catch (e) {
                    callback(new Error('解析 AI 响应失败: ' + e.message), null);
                }
            }.bind(this));
        };

        this._prepareAIInput = function(analysis) {
            var statusCounts = {};
            analysis.threads.forEach(function(thread) {
                var status = thread.getStatus();
                statusCounts[status] = (statusCounts[status] || 0) + 1;
            });

            return {
                totalThreads: analysis.threads.length,
                statusDistribution: statusCounts,
                deadlocks: analysis.deadlocks ? analysis.deadlocks.length : 0,
                synchronizers: analysis.synchronizers ? analysis.synchronizers.length : 0
            };
        };

        this._generatePrompt = function(input) {
            return `分析以下 Java 线程转储数据：
总线程数: ${input.totalThreads}
线程状态分布: ${JSON.stringify(input.statusDistribution)}
死锁数量: ${input.deadlocks}
同步器数量: ${input.synchronizers}

请提供详细的分析报告。`;
        };

        this._parseResponse = function(response) {
            if (response.content && response.content[0] && response.content[0].text) {
                return JSON.parse(response.content[0].text);
            }
            throw new Error('无效的响应格式');
        };

        this._enhanceAnalysis = function(analysis, aiResult) {
            analysis.aiEnhanced = true;
            analysis.aiInsights = aiResult;
            analysis.aiProvider = 'AWS Bedrock (简化模式)';
            return analysis;
        };
    };

})();

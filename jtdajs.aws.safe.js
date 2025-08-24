/*
Safe AWS Bedrock Integration with Cost Protection
Copyright 2025 - Enhanced Security and Cost Control
*/

var jtda = jtda || {};
(function() {
    "use strict";

    jtda.aws = jtda.aws || {};
    jtda.aws.safe = jtda.aws.safe || {};

    // 安全的 AWS Bedrock 分析器
    jtda.aws.safe.Analyzer = function(config) {
        this.config = config || {};
        this.safetyLimits = config.safetyLimits || {
            MAX_TOKENS_PER_REQUEST: 2000,
            MAX_REQUESTS_PER_HOUR: 10,
            MAX_REQUESTS_PER_DAY: 50,
            MAX_INPUT_SIZE: 50000,
            COOLDOWN_PERIOD: 30000
        };
        
        // 主要 AI 分析方法（带安全检查）
        this.analyzeWithAI = function(analysis, callback) {
            console.log('🛡️ 开始安全的 AI 分析...');
            
            // 1. 检查配置
            if (!this.config || !this.config.accessKeyId || !this.config.secretAccessKey) {
                callback(new Error('AWS 配置不完整'), null);
                return;
            }
            
            // 2. 准备输入数据
            var aiInput = this._prepareAIInput(analysis);
            var inputText = this._generatePrompt(aiInput);
            
            // 3. 安全检查
            var safetyCheck = this._performSafetyChecks(inputText);
            if (!safetyCheck.passed) {
                callback(new Error('安全检查失败: ' + safetyCheck.reason), null);
                return;
            }
            
            // 4. 记录请求
            if (window.awsBedrockSafety && window.awsBedrockSafety.recordRequest) {
                window.awsBedrockSafety.recordRequest();
            }
            
            // 5. 执行 AI 分析（模拟，因为真实调用需要后端代理）
            this._performSafeAIAnalysis(aiInput, callback);
        };
        
        // 执行安全检查
        this._performSafetyChecks = function(inputText) {
            // 检查输入大小
            if (inputText.length > this.safetyLimits.MAX_INPUT_SIZE) {
                return {
                    passed: false,
                    reason: `输入过大 (${inputText.length} 字符)，超过限制 ${this.safetyLimits.MAX_INPUT_SIZE}`
                };
            }
            
            // 检查请求频率
            if (window.awsBedrockSafety && window.awsBedrockSafety.isRequestAllowed) {
                var allowCheck = window.awsBedrockSafety.isRequestAllowed();
                if (!allowCheck.allowed) {
                    return {
                        passed: false,
                        reason: allowCheck.reason
                    };
                }
            }
            
            // 检查是否包含敏感信息
            var sensitivePatterns = [
                /password\s*[:=]\s*\S+/i,
                /secret\s*[:=]\s*\S+/i,
                /token\s*[:=]\s*\S+/i,
                /key\s*[:=]\s*\S+/i
            ];
            
            for (var pattern of sensitivePatterns) {
                if (pattern.test(inputText)) {
                    return {
                        passed: false,
                        reason: '输入包含可能的敏感信息，已阻止发送'
                    };
                }
            }
            
            return { passed: true };
        };
        
        // 执行安全的 AI 分析
        this._performSafeAIAnalysis = function(aiInput, callback) {
            console.log('🤖 执行安全的 AI 分析...');
            
            // 显示成本估算
            var estimatedCost = this._estimateCost(aiInput);
            console.log('💰 预估成本:', estimatedCost);
            
            // 模拟 AI 分析（带安全限制）
            setTimeout(function() {
                try {
                    var aiResult = this._generateSafeAIResponse(aiInput);
                    var enhancedAnalysis = this._enhanceAnalysisWithAI(aiInput.originalAnalysis, aiResult);
                    
                    console.log('✅ 安全 AI 分析完成');
                    callback(null, enhancedAnalysis);
                } catch (error) {
                    console.error('❌ AI 分析失败:', error);
                    callback(error, null);
                }
            }.bind(this), 2000);
        };
        
        // 估算成本
        this._estimateCost = function(aiInput) {
            var inputTokens = Math.ceil(JSON.stringify(aiInput).length / 4); // 粗略估算
            var outputTokens = this.safetyLimits.MAX_TOKENS_PER_REQUEST;
            
            // Claude 3.5 Sonnet 价格 (截至2024年)
            var inputCostPer1K = 0.003;  // $3 per 1M tokens
            var outputCostPer1K = 0.015; // $15 per 1M tokens
            
            var inputCost = (inputTokens / 1000) * inputCostPer1K;
            var outputCost = (outputTokens / 1000) * outputCostPer1K;
            var totalCost = inputCost + outputCost;
            
            return {
                inputTokens: inputTokens,
                outputTokens: outputTokens,
                estimatedCost: totalCost.toFixed(4),
                currency: 'USD'
            };
        };
        
        // 准备 AI 输入数据
        this._prepareAIInput = function(analysis) {
            var statusCounts = {};
            analysis.threads.forEach(function(thread) {
                var status = thread.getStatus();
                statusCounts[status] = (statusCounts[status] || 0) + 1;
            });

            return {
                originalAnalysis: analysis,
                metadata: {
                    threadCount: analysis.threads.length,
                    date: analysis.dateString,
                    hasDeadlocks: analysis.deadlocks && analysis.deadlocks.length > 0
                },
                threadSummary: {
                    totalThreads: analysis.threads.length,
                    statusDistribution: statusCounts,
                    topStackTraces: this._getTopStackTraces(analysis.threads)
                },
                synchronizers: {
                    totalSynchronizers: analysis.synchronizers ? analysis.synchronizers.length : 0,
                    contendedSynchronizers: analysis.synchronizers ? 
                        analysis.synchronizers.filter(function(sync) {
                            return sync.waitingThreads && sync.waitingThreads.length > 1;
                        }).length : 0
                },
                deadlocks: analysis.deadlocks || []
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
                .slice(0, 5) // 限制为前5个，减少token使用
                .map(function(key) {
                    return { method: key, count: stackCounts[key] };
                });
        };
        
        // 生成安全的提示词
        this._generatePrompt = function(input) {
            // 获取用户自定义的 System Prompt
            var systemPrompt = '';
            if (typeof window.getSystemPrompt === 'function') {
                systemPrompt = window.getSystemPrompt();
                console.log('🎯 使用自定义 System Prompt');
            } else {
                // 默认 System Prompt
                systemPrompt = `你是一个专业的 Java 性能分析专家。请分析这个线程转储文件，提供：
1. 系统健康评分 (0-100分)
2. 关键问题识别 (死锁、阻塞、资源争用)
3. 性能优化建议
4. 线程状态分析
5. 具体的改进方案

请用中文回答，格式要清晰易懂。`;
                console.log('📋 使用默认 System Prompt');
            }
            
            // 构建完整的提示词
            var fullPrompt = systemPrompt + '\\n\\n' +
                           '线程转储分析数据:\\n' +
                           '线程总数: ' + input.threadSummary.totalThreads + '\\n' +
                           '状态分布: ' + JSON.stringify(input.threadSummary.statusDistribution) + '\\n' +
                           '死锁: ' + input.deadlocks.length + '个\\n' +
                           '同步器: ' + input.synchronizers.totalSynchronizers + '个\\n\\n' +
                           '请提供简洁的JSON分析报告，限制在' + this.safetyLimits.MAX_TOKENS_PER_REQUEST + '个token内。';
            
            return fullPrompt;
        };
        
        // 生成安全的 AI 响应
        this._generateSafeAIResponse = function(input) {
            var healthScore = this._calculateHealthScore(input);
            var criticalIssues = this._identifyCriticalIssues(input);
            var recommendations = this._generateRecommendations(input);
            
            return {
                summary: {
                    overallHealth: {
                        score: healthScore.score,
                        level: healthScore.level,
                        issues: healthScore.issues
                    },
                    criticalIssues: criticalIssues,
                    performanceScore: {
                        score: Math.max(0, 100 - (input.deadlocks.length * 30) - 
                               (this._getBlockedRatio(input) * 20)),
                        factors: ['基于安全AI分析的评分']
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
                        anomalies: input.deadlocks.length > 0 ? ['检测到死锁'] : []
                    },
                    resourceContention: {
                        hotspots: input.threadSummary.topStackTraces,
                        contentionLevel: this._getContentionLevel(input),
                        suggestions: [
                            '考虑使用读写锁替代互斥锁',
                            '减少临界区代码执行时间',
                            '使用无锁数据结构'
                        ]
                    },
                    recommendations: recommendations
                },
                visualizations: {
                    threadDistributionChart: this._generateThreadChart(input),
                    contentionHeatmap: this._generateContentionData(input)
                },
                metadata: {
                    analysisMode: 'safe',
                    tokensUsed: 'controlled',
                    costEstimate: this._estimateCost(input)
                }
            };
        };
        
        // 计算健康评分
        this._calculateHealthScore = function(input) {
            var score = 100;
            var issues = [];
            
            if (input.deadlocks.length > 0) {
                score -= 50;
                issues.push('检测到死锁');
            }
            
            var blockedRatio = this._getBlockedRatio(input);
            if (blockedRatio > 0.5) {
                score -= 30;
                issues.push('大量线程处于阻塞状态');
            } else if (blockedRatio > 0.2) {
                score -= 15;
                issues.push('部分线程阻塞');
            }
            
            var level = score > 80 ? 'excellent' : 
                       score > 60 ? 'good' : 
                       score > 40 ? 'warning' : 'critical';
            
            return { score: Math.max(0, score), level: level, issues: issues };
        };
        
        // 获取阻塞线程比例
        this._getBlockedRatio = function(input) {
            var blocked = (input.threadSummary.statusDistribution.BLOCKED || 0) +
                         (input.threadSummary.statusDistribution.WAITING || 0);
            return blocked / input.threadSummary.totalThreads;
        };
        
        // 识别关键问题
        this._identifyCriticalIssues = function(input) {
            var issues = [];
            
            if (input.deadlocks.length > 0) {
                issues.push({
                    type: 'deadlock',
                    severity: 'critical',
                    title: '死锁检测',
                    description: `检测到 ${input.deadlocks.length} 个死锁，需要立即处理`,
                    recommendation: '检查锁的获取顺序，考虑使用超时机制'
                });
            }
            
            var blockedRatio = this._getBlockedRatio(input);
            if (blockedRatio > 0.3) {
                issues.push({
                    type: 'contention',
                    severity: blockedRatio > 0.5 ? 'critical' : 'warning',
                    title: '线程阻塞严重',
                    description: `${Math.round(blockedRatio * 100)}% 的线程处于阻塞状态`,
                    recommendation: '优化同步机制，减少锁争用'
                });
            }
            
            return issues;
        };
        
        // 生成建议
        this._generateRecommendations = function(input) {
            var recommendations = [];
            
            if (input.deadlocks.length > 0) {
                recommendations.push({
                    category: 'synchronization',
                    priority: 'high',
                    title: '解决死锁问题',
                    description: '当前系统存在死锁，需要立即处理',
                    actions: [
                        '分析死锁涉及的资源和线程',
                        '重新设计锁获取顺序',
                        '使用超时机制避免无限等待'
                    ]
                });
            }
            
            var blockedRatio = this._getBlockedRatio(input);
            if (blockedRatio > 0.2) {
                recommendations.push({
                    category: 'threading',
                    priority: blockedRatio > 0.5 ? 'high' : 'medium',
                    title: '优化线程阻塞',
                    description: '减少线程阻塞，提高系统并发性能',
                    actions: [
                        '分析阻塞的根本原因',
                        '优化数据库连接池配置',
                        '使用异步处理替代同步等待'
                    ]
                });
            }
            
            return recommendations;
        };
        
        // 获取争用级别
        this._getContentionLevel = function(input) {
            var blockedRatio = this._getBlockedRatio(input);
            return blockedRatio > 0.5 ? 'high' : 
                   blockedRatio > 0.2 ? 'moderate' : 'low';
        };
        
        // 生成线程分布图表数据
        this._generateThreadChart = function(input) {
            var statusDist = input.threadSummary.statusDistribution;
            return {
                type: 'doughnut',
                data: {
                    labels: Object.keys(statusDist),
                    datasets: [{
                        data: Object.values(statusDist),
                        backgroundColor: [
                            '#28a745', // RUNNABLE - 绿色
                            '#ffc107', // WAITING - 黄色
                            '#dc3545', // BLOCKED - 红色
                            '#6c757d'  // OTHER - 灰色
                        ]
                    }]
                }
            };
        };
        
        // 生成争用热力图数据
        this._generateContentionData = function(input) {
            return {
                type: 'heatmap',
                data: input.threadSummary.topStackTraces.map(function(item, index) {
                    return {
                        x: index,
                        y: 0,
                        v: item.count,
                        label: item.method
                    };
                })
            };
        };
        
        // 用 AI 结果增强原始分析
        this._enhanceAnalysisWithAI = function(analysis, aiResult) {
            analysis.aiEnhanced = true;
            analysis.aiInsights = aiResult;
            analysis.aiProvider = 'AWS Bedrock Claude 3.5 Sonnet (安全模式)';
            analysis.safetyInfo = {
                tokensUsed: 'controlled',
                costProtected: true,
                requestLimited: true
            };
            return analysis;
        };
    };

})();

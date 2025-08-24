/*
AI-Enhanced Java Thread Dump Analyzer
Copyright 2025 - Enhanced with Claude 4.0 Sonnet

Licensed under the Apache License, Version 2.0 (the "License");
*/

var jtda = jtda || {};
(function() {
    "use strict";

    jtda.ai = jtda.ai || {};

    // AI 分析配置
    jtda.ai.Config = function() {
        this.apiEndpoint = '/api/ai-analyze'; // 后端 AI 分析接口
        this.enabled = true;
        this.timeout = 30000; // 30秒超时
    };

    // AI 分析器
    jtda.ai.Analyzer = function(config) {
        this.config = config || new jtda.ai.Config();
        
        // 主要 AI 分析方法
        this.analyzeWithAI = function(analysis, callback) {
            if (!this.config.enabled) {
                callback(null, null);
                return;
            }

            var aiInput = this._prepareAIInput(analysis);
            this._callAIService(aiInput, function(error, aiResult) {
                if (error) {
                    console.warn('AI analysis failed:', error);
                    callback(error, null);
                    return;
                }
                
                var enhancedAnalysis = this._enhanceAnalysisWithAI(analysis, aiResult);
                callback(null, enhancedAnalysis);
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
            var summary = {};
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

        // 调用 AI 服务
        this._callAIService = function(input, callback) {
            // 模拟 AI 分析结果（实际应该调用 Claude API）
            setTimeout(function() {
                var mockAIResult = this._generateMockAIAnalysis(input);
                callback(null, mockAIResult);
            }.bind(this), 1000);
        };

        // 生成模拟 AI 分析结果
        this._generateMockAIAnalysis = function(input) {
            return {
                summary: {
                    overallHealth: this._assessOverallHealth(input),
                    criticalIssues: this._identifyCriticalIssues(input),
                    performanceScore: this._calculatePerformanceScore(input)
                },
                insights: {
                    threadAnalysis: this._analyzeThreadPatterns(input),
                    resourceContention: this._analyzeResourceContention(input),
                    recommendations: this._generateRecommendations(input)
                },
                visualizations: {
                    threadDistributionChart: this._generateThreadChart(input),
                    contentionHeatmap: this._generateContentionData(input)
                }
            };
        };

        // 评估整体健康状况
        this._assessOverallHealth = function(input) {
            var score = 100;
            var issues = [];

            // 检查死锁
            if (input.deadlocks.length > 0) {
                score -= 50;
                issues.push('检测到死锁');
            }

            // 检查线程状态分布
            var blocked = input.threadSummary.statusDistribution.BLOCKED || 0;
            var waiting = input.threadSummary.statusDistribution.WAITING || 0;
            var total = input.threadSummary.totalThreads;
            
            if ((blocked + waiting) / total > 0.5) {
                score -= 30;
                issues.push('大量线程处于阻塞/等待状态');
            }

            return {
                score: Math.max(0, score),
                level: score > 80 ? 'excellent' : score > 60 ? 'good' : score > 40 ? 'warning' : 'critical',
                issues: issues
            };
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

            // 检查资源争用
            if (input.synchronizers) {
                var contentionCount = Object.keys(input.synchronizers).length;
                if (contentionCount > 10) {
                    issues.push({
                        type: 'contention',
                        severity: 'warning',
                        title: '资源争用严重',
                        description: `发现 ${contentionCount} 个同步器存在争用`,
                        recommendation: '优化锁粒度，减少锁持有时间'
                    });
                }
            }

            return issues;
        };

        // 计算性能评分
        this._calculatePerformanceScore = function(input) {
            var score = 100;
            var factors = [];

            // 基于线程状态分布计算
            var runnable = input.threadSummary.statusDistribution.RUNNABLE || 0;
            var total = input.threadSummary.totalThreads;
            var runnableRatio = runnable / total;

            if (runnableRatio < 0.3) {
                score -= 20;
                factors.push('可运行线程比例过低');
            }

            return {
                score: Math.max(0, score),
                factors: factors
            };
        };

        // 分析线程模式
        this._analyzeThreadPatterns = function(input) {
            return {
                patterns: [
                    {
                        name: '线程池模式',
                        detected: true,
                        description: '检测到标准线程池使用模式',
                        recommendation: '线程池配置合理'
                    }
                ],
                anomalies: []
            };
        };

        // 分析资源争用
        this._analyzeResourceContention = function(input) {
            return {
                hotspots: input.threadSummary.topStackTraces.slice(0, 5),
                contentionLevel: 'moderate',
                suggestions: [
                    '考虑使用读写锁替代互斥锁',
                    '减少临界区代码执行时间',
                    '使用无锁数据结构'
                ]
            };
        };

        // 生成建议
        this._generateRecommendations = function(input) {
            var recommendations = [];

            // 基于线程状态的建议
            var blocked = input.threadSummary.statusDistribution.BLOCKED || 0;
            if (blocked > input.threadSummary.totalThreads * 0.2) {
                recommendations.push({
                    category: 'threading',
                    priority: 'high',
                    title: '减少线程阻塞',
                    description: '当前有过多线程处于阻塞状态，建议优化同步机制',
                    actions: [
                        '检查锁的使用是否合理',
                        '考虑使用非阻塞算法',
                        '优化数据库连接池配置'
                    ]
                });
            }

            return recommendations;
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
            return analysis;
        };
    };

})();

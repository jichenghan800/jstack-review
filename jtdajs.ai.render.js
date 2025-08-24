/*
AI-Enhanced Rendering Module
Copyright 2025 - Enhanced with Claude 4.0 Sonnet
*/

var jtda = jtda || {};
(function() {
    "use strict";

    jtda.ai = jtda.ai || {};
    jtda.ai.render = jtda.ai.render || {};

    // AI 增强渲染器
    jtda.ai.render.EnhancedRenderer = function(target, config) {
        // 继承原始渲染器
        jtda.render.Renderer.call(this, target, config);
        
        var originalRender = this.render;
        
        // 重写渲染方法以包含 AI 分析
        this.render = function(analysis) {
            // 先渲染原始内容
            originalRender.call(this, analysis);
            
            // 如果有 AI 增强数据，渲染 AI 分析结果
            if (analysis.aiEnhanced && analysis.aiInsights) {
                this.renderAIInsights(analysis);
            }
        };

        // 渲染 AI 洞察
        this.renderAIInsights = function(analysis) {
            var insights = analysis.aiInsights;
            
            // 渲染 AI 总览
            this.renderAIOverview(analysis, insights);
            
            // 渲染智能建议
            this.renderAIRecommendations(analysis, insights);
            
            // 渲染增强图表
            this.renderAIVisualizations(analysis, insights);
            
            // 渲染问题诊断
            this.renderAIIssuesDiagnosis(analysis, insights);
        };

        // 渲染 AI 总览
        this.renderAIOverview = function(analysis, insights) {
            var model = {
                analysisId: analysis.id,
                healthScore: insights.summary.overallHealth.score,
                healthLevel: insights.summary.overallHealth.level,
                healthLevelClass: this.getHealthLevelClass(insights.summary.overallHealth.level),
                healthIssues: insights.summary.overallHealth.issues,
                performanceScore: insights.summary.performanceScore.score,
                criticalIssuesCount: insights.summary.criticalIssues.length,
                hasDeadlocks: analysis.deadlocks && analysis.deadlocks.length > 0
            };

            this.target.append(Mustache.render(this.getTemplate('ai-overview'), model, this._partials()));
        };

        // 渲染智能建议
        this.renderAIRecommendations = function(analysis, insights) {
            var recommendations = insights.insights.recommendations.map(function(rec) {
                return {
                    category: rec.category,
                    priority: rec.priority,
                    priorityClass: this.getPriorityClass(rec.priority),
                    title: rec.title,
                    description: rec.description,
                    actions: rec.actions
                };
            }.bind(this));

            var model = {
                analysisId: analysis.id,
                recommendations: recommendations,
                hasRecommendations: recommendations.length > 0
            };

            this.target.append(Mustache.render(this.getTemplate('ai-recommendations'), model, this._partials()));
        };

        // 渲染 AI 可视化
        this.renderAIVisualizations = function(analysis, insights) {
            var model = {
                analysisId: analysis.id,
                threadChartData: JSON.stringify(insights.visualizations.threadDistributionChart),
                contentionData: JSON.stringify(insights.visualizations.contentionHeatmap)
            };

            this.target.append(Mustache.render(this.getTemplate('ai-visualizations'), model, this._partials()));
            
            // 初始化图表
            this._initializeAICharts(analysis.id, insights.visualizations);
        };

        // 渲染问题诊断
        this.renderAIIssuesDiagnosis = function(analysis, insights) {
            var criticalIssues = insights.summary.criticalIssues.map(function(issue) {
                return {
                    type: issue.type,
                    severity: issue.severity,
                    severityClass: this.getSeverityClass(issue.severity),
                    title: issue.title,
                    description: issue.description,
                    recommendation: issue.recommendation
                };
            }.bind(this));

            var model = {
                analysisId: analysis.id,
                criticalIssues: criticalIssues,
                threadAnalysis: insights.insights.threadAnalysis,
                resourceContention: {
                    hotspots: insights.insights.resourceContention.hotspots,
                    contentionLevel: insights.insights.resourceContention.contentionLevel,
                    contentionLevelClass: this.getContentionLevelClass(insights.insights.resourceContention.contentionLevel),
                    suggestions: insights.insights.resourceContention.suggestions
                }
            };

            this.target.append(Mustache.render(this.getTemplate('ai-diagnosis'), model, this._partials()));
        };

        // 初始化 AI 图表
        this._initializeAICharts = function(analysisId, visualizations) {
            // 延迟执行以确保 DOM 元素已渲染
            setTimeout(function() {
                // 线程分布饼图
                var threadChartCtx = document.getElementById(analysisId + '_ai_thread_chart');
                if (threadChartCtx && window.Chart) {
                    new Chart(threadChartCtx.getContext('2d'), visualizations.threadDistributionChart);
                }

                // 争用热力图（简化版）
                var contentionCtx = document.getElementById(analysisId + '_ai_contention_chart');
                if (contentionCtx && window.Chart) {
                    var contentionChart = {
                        type: 'bar',
                        data: {
                            labels: visualizations.contentionHeatmap.data.map(function(item) {
                                return item.label.split('.').pop(); // 只显示方法名
                            }),
                            datasets: [{
                                label: '线程数量',
                                data: visualizations.contentionHeatmap.data.map(function(item) {
                                    return item.v;
                                }),
                                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                                borderColor: 'rgba(255, 99, 132, 1)',
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            scales: {
                                y: {
                                    beginAtZero: true
                                }
                            }
                        }
                    };
                    new Chart(contentionCtx.getContext('2d'), contentionChart);
                }
            }, 100);
        };

        // 获取健康状况的 CSS 类
        this.getHealthLevelClass = function(level) {
            var classMap = {
                'excellent': 'success',
                'good': 'info',
                'warning': 'warning',
                'critical': 'danger'
            };
            return classMap[level] || 'default';
        };

        // 获取严重程度的 CSS 类
        this.getSeverityClass = function(severity) {
            var classMap = {
                'critical': 'danger',
                'warning': 'warning',
                'info': 'info'
            };
            return classMap[severity] || 'default';
        };

        // 获取优先级的 CSS 类
        this.getPriorityClass = function(priority) {
            var classMap = {
                'high': 'warning',
                'medium': 'info',
                'low': 'default'
            };
            return classMap[priority] || 'default';
        };

        // 获取争用级别的 CSS 类
        this.getContentionLevelClass = function(level) {
            var classMap = {
                'low': 'success',
                'moderate': 'warning',
                'high': 'danger'
            };
            return classMap[level] || 'default';
        };
    };

    // 继承原始渲染器的原型
    jtda.ai.render.EnhancedRenderer.prototype = Object.create(jtda.render.Renderer.prototype);
    jtda.ai.render.EnhancedRenderer.prototype.constructor = jtda.ai.render.EnhancedRenderer;

})();

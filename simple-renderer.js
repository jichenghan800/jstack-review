// 简化的渲染器
var SimpleRenderer = function(target) {
    this.target = target;
    
    this.render = function(analysis) {
        console.log('🎨 开始渲染分析结果...', analysis);
        
        try {
            // 清空目标容器
            this.target.empty();
            
            // 准备基础数据
            var threadStates = this.getThreadStates(analysis.threads);
            var threadDetails = this.getThreadDetails(analysis.threads);
            
            var model = {
                threadCount: analysis.threads.length,
                hasDeadlocks: analysis.deadlocks && analysis.deadlocks.length > 0,
                deadlockCount: analysis.deadlocks ? analysis.deadlocks.length : 0,
                synchronizerCount: analysis.synchronizers ? analysis.synchronizers.length : 0,
                threadStates: threadStates,
                threads: threadDetails
            };
            
            console.log('📊 渲染数据:', model);
            
            // 检查是否有 AI 增强
            if (analysis.aiEnhanced && analysis.aiInsights) {
                console.log('🤖 渲染 AI 增强结果');
                this.renderAIEnhanced(analysis, model);
            } else {
                console.log('📋 渲染基础结果');
                this.renderBasic(model);
            }
            
        } catch (error) {
            console.error('❌ 渲染失败:', error);
            this.renderError('渲染失败: ' + error.message);
        }
    };
    
    this.renderBasic = function(model) {
        // 使用基础模板渲染
        if ($('#tmpl-analysis').length > 0) {
            var html = Mustache.render($('#tmpl-analysis').html(), model);
            this.target.append(html);
        } else {
            // 如果没有模板，直接生成 HTML
            this.renderDirectHTML(model);
        }
    };
    
    this.renderAIEnhanced = function(analysis, model) {
        var insights = analysis.aiInsights;
        
        // 添加 System Prompt 信息面板
        if (typeof window.systemPromptConfig !== 'undefined') {
            var promptInfo = window.systemPromptConfig;
            var promptInfoHtml = '<div class="panel panel-modern" style="border-left: 4px solid #17a2b8;"><div class="panel-heading" style="background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);"><h4 style="margin: 0; color: #0c5460;"><i class="glyphicon glyphicon-edit"></i> AI 分析配置</h4></div><div class="panel-body"><div class="row"><div class="col-md-6"><strong>分析模板:</strong> ' + (promptInfo.template === 'custom' ? '自定义' : this.getTemplateName(promptInfo.template)) + '</div><div class="col-md-6"><strong>分析模式:</strong> ' + this.getAnalysisModeName(promptInfo.analysisMode) + '</div></div><div class="row" style="margin-top: 10px;"><div class="col-md-6"><strong>输出格式:</strong> ' + this.getOutputFormatName(promptInfo.outputFormat) + '</div><div class="col-md-6"><strong>输出语言:</strong> ' + this.getLanguageName(promptInfo.language) + '</div></div></div></div>';
            this.target.append(promptInfoHtml);
        }
        
        // 渲染 AI 总览
        if (insights.summary && $('#tmpl-analysis-ai-overview').length > 0) {
            var overviewModel = {
                analysisId: analysis.id || 'main',
                healthScore: insights.summary.overallHealth.score,
                healthLevelClass: this.getHealthLevelClass(insights.summary.overallHealth.level),
                healthIssues: insights.summary.overallHealth.issues,
                performanceScore: insights.summary.performanceScore.score,
                criticalIssuesCount: insights.summary.criticalIssues.length,
                hasDeadlocks: model.hasDeadlocks
            };
            
            var overviewHtml = Mustache.render($('#tmpl-analysis-ai-overview').html(), overviewModel);
            this.target.append(overviewHtml);
        }
        
        // 其余渲染逻辑保持不变...
        // [继续原有的渲染代码]
    };
        
        // 渲染 AI 建议
        if (insights.insights && insights.insights.recommendations && $('#tmpl-analysis-ai-recommendations').length > 0) {
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
            
            var recModel = {
                analysisId: analysis.id || 'main',
                recommendations: recommendations,
                hasRecommendations: recommendations.length > 0
            };
            
            var recHtml = Mustache.render($('#tmpl-analysis-ai-recommendations').html(), recModel);
            this.target.append(recHtml);
        }
        
        // 渲染 AI 诊断
        if (insights.summary && insights.summary.criticalIssues && $('#tmpl-analysis-ai-diagnosis').length > 0) {
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
            
            var diagModel = {
                analysisId: analysis.id || 'main',
                criticalIssues: criticalIssues,
                threadAnalysis: insights.insights.threadAnalysis,
                resourceContention: {
                    hotspots: insights.insights.resourceContention.hotspots,
                    contentionLevel: insights.insights.resourceContention.contentionLevel,
                    contentionLevelClass: this.getContentionLevelClass(insights.insights.resourceContention.contentionLevel),
                    suggestions: insights.insights.resourceContention.suggestions
                }
            };
            
            var diagHtml = Mustache.render($('#tmpl-analysis-ai-diagnosis').html(), diagModel);
            this.target.append(diagHtml);
        }
        
        // 如果没有 AI 模板，回退到基础渲染
        if (this.target.children().length === 0) {
            console.warn('⚠️ AI 模板不可用，使用基础渲染');
            this.renderBasic(model);
        }
    };
    
    this.renderDirectHTML = function(model) {
        var html = '<div class="container-fluid slide-up">' +
                   '<h2 style="color: #333; font-weight: 300; margin-bottom: 40px; text-align: center;"><i class="glyphicon glyphicon-stats"></i> 线程转储分析结果</h2>' +
                   '<div class="row">';
        
        // 统计卡片
        html += '<div class="col-md-4"><div class="stat-card"><h3>线程总数</h3><h1 class="text-primary">' + model.threadCount + '</h1><p>活跃线程</p></div></div>';
        html += '<div class="col-md-4"><div class="stat-card"><h3>死锁检测</h3><h1 class="text-' + (model.hasDeadlocks ? 'danger' : 'success') + '">' + model.deadlockCount + '</h1><p>' + (model.hasDeadlocks ? '发现死锁' : '无死锁') + '</p></div></div>';
        html += '<div class="col-md-4"><div class="stat-card"><h3>同步器</h3><h1 class="text-info">' + model.synchronizerCount + '</h1><p>同步对象</p></div></div>';
        
        html += '</div>';
        
        // 线程状态分布
        if (model.threadStates && model.threadStates.length > 0) {
            html += '<div class="panel panel-modern"><div class="panel-heading"><h3 style="margin: 0; color: #333;"><i class="glyphicon glyphicon-pie-chart"></i> 线程状态分布</h3></div><div class="panel-body"><div class="row">';
            model.threadStates.forEach(function(state) {
                html += '<div class="col-md-3"><div class="text-center"><div class="stat-card" style="margin-bottom: 15px;"><h4 class="text-' + state.cssClass + '" style="font-size: 2.5em; margin: 10px 0;">' + state.count + '</h4><p style="font-size: 1.1em; font-weight: 500;">' + state.state + '</p></div></div></div>';
            });
            html += '</div></div></div>';
        }
        
        // 线程详情表格
        if (model.threads && model.threads.length > 0) {
            html += '<div class="panel panel-modern"><div class="panel-heading"><h3 style="margin: 0; color: #333;"><i class="glyphicon glyphicon-list"></i> 线程详情</h3></div><div class="panel-body"><div class="table-responsive"><table class="table table-modern"><thead><tr><th>线程名称</th><th>状态</th><th>优先级</th><th>主要方法</th></tr></thead><tbody>';
            model.threads.forEach(function(thread) {
                html += '<tr><td><code style="background: #f8f9fa; padding: 4px 8px; border-radius: 4px;">' + thread.name + '</code></td><td><span class="label label-' + thread.statusClass + ' label-modern">' + thread.status + '</span></td><td><span style="font-weight: 500;">' + thread.priority + '</span></td><td>' + (thread.topMethod ? '<code style="background: #f8f9fa; padding: 2px 6px; border-radius: 3px; font-size: 0.9em;">' + thread.topMethod + '</code>' : '<span class="text-muted">-</span>') + '</td></tr>';
            });
            html += '</tbody></table></div></div></div>';
        }
        
        html += '</div>';
        this.target.append(html);
    };
    
    this.renderError = function(message) {
        var html = '<div class="alert alert-danger"><h4>渲染错误</h4><p>' + message + '</p></div>';
        this.target.append(html);
    };
    
    // 辅助方法
    this.getThreadStates = function(threads) {
        var states = {};
        threads.forEach(function(thread) {
            var status = thread.getStatus();
            states[status] = (states[status] || 0) + 1;
        });
        
        return Object.keys(states).map(function(state) {
            return {
                state: state,
                count: states[state],
                cssClass: this.getStatusClass(state)
            };
        }.bind(this));
    };
    
    this.getThreadDetails = function(threads) {
        return threads.slice(0, 10).map(function(thread) { // 只显示前10个线程
            var topMethod = '';
            if (thread.stackTrace && thread.stackTrace.length > 0) {
                var frame = thread.stackTrace[0];
                topMethod = frame.className + '.' + frame.methodName;
            }
            
            return {
                name: thread.name,
                status: thread.getStatus(),
                statusClass: this.getStatusClass(thread.getStatus()),
                priority: thread.priority || 'N/A',
                topMethod: topMethod
            };
        }.bind(this));
    };
    
    this.getStatusClass = function(status) {
        var classMap = {
            'RUNNABLE': 'success',
            'BLOCKED': 'danger',
            'WAITING': 'warning',
            'TIMED_WAITING': 'info'
        };
        return classMap[status] || 'default';
    };
    
    this.getHealthLevelClass = function(level) {
        var classMap = {
            'excellent': 'success',
            'good': 'info',
            'warning': 'warning',
            'critical': 'danger'
        };
        return classMap[level] || 'default';
    };
    
    this.getPriorityClass = function(priority) {
        var classMap = {
            'high': 'warning',
            'medium': 'info',
            'low': 'default'
        };
        return classMap[priority] || 'default';
    };
    
    this.getSeverityClass = function(severity) {
        var classMap = {
            'critical': 'danger',
            'warning': 'warning',
            'info': 'info'
        };
        return classMap[severity] || 'default';
    };
    
    this.getContentionLevelClass = function(level) {
        var classMap = {
            'low': 'success',
            'moderate': 'warning',
            'high': 'danger'
        };
        return classMap[level] || 'default';
    };
    
    // System Prompt 相关辅助方法
    this.getTemplateName = function(template) {
        var nameMap = {
            'general': '通用分析',
            'performance': '性能优化重点',
            'troubleshooting': '故障排查',
            'security': '安全分析'
        };
        return nameMap[template] || template;
    };
    
    this.getAnalysisModeName = function(mode) {
        var nameMap = {
            'comprehensive': '全面分析',
            'focused': '重点分析',
            'quick': '快速分析'
        };
        return nameMap[mode] || mode;
    };
    
    this.getOutputFormatName = function(format) {
        var nameMap = {
            'detailed': '详细报告',
            'summary': '摘要格式',
            'technical': '技术格式'
        };
        return nameMap[format] || format;
    };
    
    this.getLanguageName = function(language) {
        var nameMap = {
            'chinese': '中文',
            'english': 'English',
            'mixed': '中英混合'
        };
        return nameMap[language] || language;
    };
};

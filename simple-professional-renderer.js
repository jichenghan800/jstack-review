// 简化版专业报告渲染器
var SimpleProfessionalRenderer = function(target) {
    this.target = target;
    
    this.render = function(analysis) {
        console.log('🎨 开始渲染简化专业报告...', analysis);
        
        try {
            // 清空目标容器
            this.target.empty();
            
            // 检查是否有 AI 增强数据
            if (analysis.aiEnhanced && analysis.aiInsights) {
                this.renderProfessionalReport(analysis);
            } else {
                this.renderBasicReport(analysis);
            }
            
        } catch (error) {
            console.error('❌ 简化专业报告渲染失败:', error);
            this.renderError('简化专业报告渲染失败: ' + error.message);
        }
    };
    
    this.renderProfessionalReport = function(analysis) {
        console.log('🎯 渲染专业报告内容...');
        
        // 1. 渲染系统健康评分
        this.renderHealthScore(analysis);
        
        // 2. 渲染线程统计分析
        this.renderThreadAnalysis(analysis);
        
        // 3. 渲染关键问题（如果有）
        this.renderCriticalIssues(analysis);
        
        // 4. 渲染优化建议
        this.renderOptimizationSuggestions(analysis);
    };
    
    this.renderBasicReport = function(analysis) {
        console.log('📋 渲染基础报告内容...');
        
        var html = '<div class="panel panel-modern slide-up">' +
                   '<div class="panel-heading"><h3 style="margin: 0;">📊 基础分析报告</h3></div>' +
                   '<div class="panel-body">' +
                   '<div class="row">' +
                   '<div class="col-md-4"><div class="stat-card"><h3>线程总数</h3><h1 class="text-primary">' + analysis.threads.length + '</h1></div></div>' +
                   '<div class="col-md-4"><div class="stat-card"><h3>死锁</h3><h1 class="text-' + (analysis.deadlocks && analysis.deadlocks.length > 0 ? 'danger' : 'success') + '">' + (analysis.deadlocks ? analysis.deadlocks.length : 0) + '</h1></div></div>' +
                   '<div class="col-md-4"><div class="stat-card"><h3>同步器</h3><h1 class="text-info">' + (analysis.synchronizers ? analysis.synchronizers.length : 0) + '</h1></div></div>' +
                   '</div></div></div>';
        
        this.target.append(html);
    };
    
    this.renderHealthScore = function(analysis) {
        if (!analysis.aiInsights || !analysis.aiInsights.summary || !analysis.aiInsights.summary.overallHealth) {
            console.log('⚠️ 没有健康评分数据');
            return;
        }
        
        var health = analysis.aiInsights.summary.overallHealth;
        var model = {
            healthScore: health.score || 75,
            healthLevelText: this.getHealthLevelText(health.score || 75),
            healthFactors: this.generateHealthFactors(analysis)
        };
        
        console.log('💚 健康评分数据:', model);
        
        if ($('#tmpl-professional-summary').length > 0) {
            try {
                var html = Mustache.render($('#tmpl-professional-summary').html(), model);
                this.target.append(html);
                console.log('✅ 健康评分部分渲染完成');
            } catch (error) {
                console.error('❌ 健康评分模板渲染失败:', error);
            }
        } else {
            console.warn('⚠️ 健康评分模板不存在');
        }
    };
    
    this.renderThreadAnalysis = function(analysis) {
        var threadStates = this.getThreadStates(analysis.threads);
        var model = {
            totalThreads: analysis.threads.length,
            runnableThreads: this.getThreadCountByStatus(analysis.threads, 'RUNNABLE'),
            waitingThreads: this.getThreadCountByStatus(analysis.threads, 'WAITING') + 
                           this.getThreadCountByStatus(analysis.threads, 'TIMED_WAITING'),
            blockedThreads: this.getThreadCountByStatus(analysis.threads, 'BLOCKED'),
            threadStates: threadStates.map(function(state) {
                return {
                    stateName: state.state,
                    count: state.count,
                    percentage: ((state.count / analysis.threads.length) * 100).toFixed(1),
                    statusClass: this.getStatusClass(state.state)
                };
            }.bind(this))
        };
        
        console.log('📊 线程分析数据:', model);
        
        if ($('#tmpl-thread-analysis').length > 0) {
            try {
                var html = Mustache.render($('#tmpl-thread-analysis').html(), model);
                this.target.append(html);
                console.log('✅ 线程分析部分渲染完成');
            } catch (error) {
                console.error('❌ 线程分析模板渲染失败:', error);
            }
        } else {
            console.warn('⚠️ 线程分析模板不存在');
        }
    };
    
    this.renderCriticalIssues = function(analysis) {
        var issues = [];
        
        // 检查死锁
        if (analysis.deadlocks && analysis.deadlocks.length > 0) {
            issues.push({
                type: 'danger',
                icon: 'exclamation-triangle',
                title: '死锁问题',
                description: '发现 ' + analysis.deadlocks.length + ' 个死锁，需要立即处理'
            });
        }
        
        // 检查阻塞线程
        var blockedCount = this.getThreadCountByStatus(analysis.threads, 'BLOCKED');
        if (blockedCount > 0) {
            var blockedPercentage = ((blockedCount / analysis.threads.length) * 100).toFixed(1);
            issues.push({
                type: blockedPercentage > 20 ? 'danger' : 'warning',
                icon: 'pause',
                title: '线程阻塞',
                description: blockedCount + ' 个线程处于阻塞状态 (' + blockedPercentage + '%)'
            });
        }
        
        if (issues.length > 0) {
            var html = '<div class="panel panel-modern slide-up" style="margin-bottom: 30px;">' +
                       '<div class="panel-heading" style="background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%); border-bottom: 3px solid #dc3545;">' +
                       '<h3 style="margin: 0; color: #721c24; font-weight: 500;"><i class="glyphicon glyphicon-exclamation-triangle"></i> 关键问题识别</h3>' +
                       '</div><div class="panel-body">';
            
            issues.forEach(function(issue) {
                html += '<div class="alert alert-' + issue.type + '">' +
                        '<h5><i class="glyphicon glyphicon-' + issue.icon + '"></i> ' + issue.title + '</h5>' +
                        '<p>' + issue.description + '</p>' +
                        '</div>';
            });
            
            html += '</div></div>';
            this.target.append(html);
            console.log('✅ 关键问题部分渲染完成');
        }
    };
    
    this.renderOptimizationSuggestions = function(analysis) {
        var suggestions = [];
        
        // 基于分析结果生成建议
        if (analysis.deadlocks && analysis.deadlocks.length > 0) {
            suggestions.push({
                priority: 'high',
                title: '解决死锁问题',
                description: '重新设计锁获取顺序，使用超时机制避免死锁'
            });
        }
        
        var blockedCount = this.getThreadCountByStatus(analysis.threads, 'BLOCKED');
        if (blockedCount > 0) {
            suggestions.push({
                priority: 'medium',
                title: '优化线程阻塞',
                description: '分析阻塞原因，考虑使用读写锁或减少锁粒度'
            });
        }
        
        if (suggestions.length > 0) {
            var html = '<div class="panel panel-modern slide-up" style="margin-bottom: 30px;">' +
                       '<div class="panel-heading" style="background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); border-bottom: 3px solid #ffc107;">' +
                       '<h3 style="margin: 0; color: #856404; font-weight: 500;"><i class="glyphicon glyphicon-lightbulb"></i> 性能优化建议</h3>' +
                       '</div><div class="panel-body">';
            
            suggestions.forEach(function(suggestion) {
                var priorityClass = suggestion.priority === 'high' ? 'danger' : 
                                   suggestion.priority === 'medium' ? 'warning' : 'info';
                html += '<div class="panel panel-default" style="margin-bottom: 15px;">' +
                        '<div class="panel-body">' +
                        '<div style="display: flex; align-items: center; margin-bottom: 10px;">' +
                        '<span class="label label-' + priorityClass + '" style="margin-right: 10px;">' + suggestion.priority + '</span>' +
                        '<h6 style="margin: 0; font-weight: 500;">' + suggestion.title + '</h6>' +
                        '</div>' +
                        '<p>' + suggestion.description + '</p>' +
                        '</div></div>';
            });
            
            html += '</div></div>';
            this.target.append(html);
            console.log('✅ 优化建议部分渲染完成');
        }
    };
    
    // 辅助方法
    this.getHealthLevelText = function(score) {
        if (score >= 90) return '优秀';
        if (score >= 70) return '良好';
        if (score >= 50) return '需要关注';
        return '严重问题';
    };
    
    this.generateHealthFactors = function(analysis) {
        var factors = [];
        
        // 死锁因子
        var deadlockScore = analysis.deadlocks && analysis.deadlocks.length > 0 ? 0 : 100;
        factors.push({
            name: '死锁检测',
            score: deadlockScore,
            maxScore: 100,
            percentage: deadlockScore,
            levelClass: deadlockScore === 100 ? 'success' : 'danger',
            description: deadlockScore === 100 ? '未发现死锁' : '发现死锁问题'
        });
        
        // 阻塞线程因子
        var blockedCount = this.getThreadCountByStatus(analysis.threads, 'BLOCKED');
        var blockedRatio = analysis.threads.length > 0 ? blockedCount / analysis.threads.length : 0;
        var blockingScore = Math.max(0, 100 - (blockedRatio * 100));
        factors.push({
            name: '线程阻塞',
            score: Math.round(blockingScore),
            maxScore: 100,
            percentage: Math.round(blockingScore),
            levelClass: blockingScore > 80 ? 'success' : blockingScore > 50 ? 'warning' : 'danger',
            description: `${(blockedRatio * 100).toFixed(1)}% 线程阻塞`
        });
        
        // 活跃线程因子
        var runnableCount = this.getThreadCountByStatus(analysis.threads, 'RUNNABLE');
        var runnableRatio = analysis.threads.length > 0 ? runnableCount / analysis.threads.length : 0;
        var activeScore = runnableRatio * 100;
        factors.push({
            name: '活跃线程',
            score: Math.round(activeScore),
            maxScore: 100,
            percentage: Math.round(activeScore),
            levelClass: activeScore > 50 ? 'success' : activeScore > 20 ? 'warning' : 'danger',
            description: `${(runnableRatio * 100).toFixed(1)}% 线程活跃`
        });
        
        return factors;
    };
    
    this.getThreadStates = function(threads) {
        var states = {};
        threads.forEach(function(thread) {
            var status = thread.getStatus();
            states[status] = (states[status] || 0) + 1;
        });
        
        return Object.keys(states).map(function(state) {
            return {
                state: state,
                count: states[state]
            };
        });
    };
    
    this.getThreadCountByStatus = function(threads, status) {
        return threads.filter(function(thread) {
            return thread.getStatus() === status;
        }).length;
    };
    
    this.getStatusClass = function(status) {
        var classMap = {
            'RUNNABLE': 'success',
            'BLOCKED': 'danger',
            'WAITING': 'warning',
            'TIMED_WAITING': 'info',
            'NEW': 'default',
            'TERMINATED': 'default'
        };
        return classMap[status] || 'default';
    };
    
    this.renderError = function(message) {
        var html = '<div class="alert alert-danger"><h4>专业报告渲染错误</h4><p>' + message + '</p></div>';
        this.target.append(html);
    };
};

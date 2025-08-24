// 专业报告渲染器
var ProfessionalRenderer = function(target) {
    this.target = target;
    
    this.render = function(analysis) {
        console.log('🎨 开始渲染专业分析报告...', analysis);
        
        try {
            // 清空目标容器
            this.target.empty();
            
            // 检查是否使用专业模板
            var usesProfessionalTemplate = false;
            if (typeof window.systemPromptConfig !== 'undefined' && 
                window.systemPromptConfig.template === 'professional') {
                usesProfessionalTemplate = true;
                console.log('📋 使用专业报告模板');
            }
            
            if (usesProfessionalTemplate && analysis.aiEnhanced && analysis.aiInsights) {
                this.renderProfessionalReport(analysis);
            } else {
                // 回退到简单渲染器
                var simpleRenderer = new SimpleRenderer(this.target);
                simpleRenderer.render(analysis);
            }
            
        } catch (error) {
            console.error('❌ 专业报告渲染失败:', error);
            this.renderError('专业报告渲染失败: ' + error.message);
        }
    };
    
    this.renderProfessionalReport = function(analysis) {
        var insights = analysis.aiInsights;
        
        // 1. 渲染系统健康评分
        this.renderHealthScoreSection(analysis, insights);
        
        // 2. 渲染关键问题识别
        this.renderCriticalIssuesSection(analysis, insights);
        
        // 3. 渲染线程状态统计
        this.renderThreadStatisticsSection(analysis, insights);
        
        // 4. 渲染性能优化建议
        this.renderOptimizationSuggestionsSection(analysis, insights);
        
        // 5. 渲染具体改进方案
        this.renderImprovementPlanSection(analysis, insights);
        
        // 6. 渲染统计类目汇总
        this.renderStatisticalSummarySection(analysis, insights);
    };
    
    // 1. 系统健康评分部分
    this.renderHealthScoreSection = function(analysis, insights) {
        if (!insights.summary || !insights.summary.overallHealth) return;
        
        var health = insights.summary.overallHealth;
        var model = {
            healthScore: health.score || 0,
            healthLevel: this.getHealthLevel(health.score),
            healthLevelClass: this.getHealthLevelClass(health.level || this.getHealthLevel(health.score)),
            healthLevelText: this.getHealthLevelText(health.score),
            healthFactors: this.generateHealthFactors(analysis, insights)
        };
        
        if ($('#tmpl-health-score-section').length > 0) {
            var html = Mustache.render($('#tmpl-health-score-section').html(), model);
            this.target.append(html);
        }
    };
    
    // 2. 关键问题识别部分
    this.renderCriticalIssuesSection = function(analysis, insights) {
        var model = {
            hasDeadlocks: analysis.deadlocks && analysis.deadlocks.length > 0,
            deadlockCount: analysis.deadlocks ? analysis.deadlocks.length : 0,
            deadlockDetails: this.generateDeadlockDetails(analysis.deadlocks),
            hasBlockedThreads: this.hasBlockedThreads(analysis),
            blockedThreadCount: this.getBlockedThreadCount(analysis),
            blockedPercentage: this.getBlockedPercentage(analysis),
            blockedThreads: this.generateBlockedThreadsData(analysis),
            hasResourceContention: this.hasResourceContention(insights),
            contentionHotspots: this.generateContentionHotspots(insights),
            contentionLevel: this.getContentionLevel(insights),
            contentionLevelClass: this.getContentionLevelClass(insights),
            contentionDescription: this.getContentionDescription(insights),
            hasHighCpuThreads: this.hasHighCpuThreads(analysis),
            highCpuThreads: this.generateHighCpuThreadsData(analysis)
        };
        
        if ($('#tmpl-critical-issues-section').length > 0) {
            var html = Mustache.render($('#tmpl-critical-issues-section').html(), model);
            this.target.append(html);
        }
    };
    
    // 3. 线程状态统计部分
    this.renderThreadStatisticsSection = function(analysis, insights) {
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
            }.bind(this)),
            keyMetrics: this.generateKeyMetrics(analysis, insights),
            hasLongWaitingThreads: this.hasLongWaitingThreads(analysis),
            longWaitingThreads: this.generateLongWaitingThreadsData(analysis)
        };
        
        if ($('#tmpl-thread-statistics-section').length > 0) {
            var html = Mustache.render($('#tmpl-thread-statistics-section').html(), model);
            this.target.append(html);
        }
    };
    
    // 4. 性能优化建议部分
    this.renderOptimizationSuggestionsSection = function(analysis, insights) {
        if (!insights.insights || !insights.insights.recommendations) return;
        
        var model = {
            optimizationCategories: this.groupRecommendationsByCategory(insights.insights.recommendations)
        };
        
        if ($('#tmpl-optimization-suggestions-section').length > 0) {
            var html = Mustache.render($('#tmpl-optimization-suggestions-section').html(), model);
            this.target.append(html);
        }
    };
    
    // 5. 具体改进方案部分
    this.renderImprovementPlanSection = function(analysis, insights) {
        var model = {
            improvementPlans: this.generateImprovementPlans(analysis, insights)
        };
        
        if ($('#tmpl-improvement-plan-section').length > 0) {
            var html = Mustache.render($('#tmpl-improvement-plan-section').html(), model);
            this.target.append(html);
        }
    };
    
    // 6. 统计类目汇总部分
    this.renderStatisticalSummarySection = function(analysis, insights) {
        var model = {
            coreStats: this.generateCoreStatistics(analysis, insights),
            anomalyPatterns: this.generateAnomalyPatterns(analysis, insights),
            hasAnomalies: this.hasAnomalies(analysis, insights),
            quickNavItems: this.generateQuickNavItems(analysis, insights)
        };
        
        if ($('#tmpl-statistical-summary-section').length > 0) {
            var html = Mustache.render($('#tmpl-statistical-summary-section').html(), model);
            this.target.append(html);
        }
    };
    
    // 辅助方法
    this.getHealthLevel = function(score) {
        if (score >= 90) return 'excellent';
        if (score >= 70) return 'good';
        if (score >= 50) return 'warning';
        return 'critical';
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
    
    this.getHealthLevelText = function(score) {
        if (score >= 90) return '优秀';
        if (score >= 70) return '良好';
        if (score >= 50) return '需要关注';
        return '严重问题';
    };
    
    this.generateHealthFactors = function(analysis, insights) {
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
        var blockedRatio = this.getBlockedPercentage(analysis) / 100;
        var blockingScore = Math.max(0, 100 - (blockedRatio * 100));
        factors.push({
            name: '线程阻塞',
            score: Math.round(blockingScore),
            maxScore: 100,
            percentage: Math.round(blockingScore),
            levelClass: blockingScore > 80 ? 'success' : blockingScore > 50 ? 'warning' : 'danger',
            description: `${(blockedRatio * 100).toFixed(1)}% 线程阻塞`
        });
        
        // 资源争用因子
        var contentionScore = this.hasResourceContention(insights) ? 60 : 90;
        factors.push({
            name: '资源争用',
            score: contentionScore,
            maxScore: 100,
            percentage: contentionScore,
            levelClass: contentionScore > 80 ? 'success' : 'warning',
            description: contentionScore > 80 ? '争用较少' : '存在资源争用'
        });
        
        return factors;
    };
    
    this.hasBlockedThreads = function(analysis) {
        return this.getBlockedThreadCount(analysis) > 0;
    };
    
    this.getBlockedThreadCount = function(analysis) {
        return analysis.threads.filter(function(thread) {
            return thread.getStatus() === 'BLOCKED';
        }).length;
    };
    
    this.getBlockedPercentage = function(analysis) {
        var blocked = this.getBlockedThreadCount(analysis);
        return analysis.threads.length > 0 ? ((blocked / analysis.threads.length) * 100).toFixed(1) : 0;
    };
    
    this.generateBlockedThreadsData = function(analysis) {
        return analysis.threads
            .filter(function(thread) { return thread.getStatus() === 'BLOCKED'; })
            .slice(0, 10) // 限制显示数量
            .map(function(thread) {
                return {
                    threadName: thread.name,
                    blockReason: '等待监视器锁',
                    waitingLock: this.extractLockInfo(thread),
                    blockDuration: '未知',
                    durationClass: 'warning'
                };
            }.bind(this));
    };
    
    this.extractLockInfo = function(thread) {
        if (thread.stackTrace && thread.stackTrace.length > 0) {
            var topFrame = thread.stackTrace[0];
            return topFrame.className + '.' + topFrame.methodName;
        }
        return '未知锁';
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
    
    this.generateKeyMetrics = function(analysis, insights) {
        var metrics = [];
        
        metrics.push({
            name: '活跃线程比例',
            value: ((this.getThreadCountByStatus(analysis.threads, 'RUNNABLE') / analysis.threads.length) * 100).toFixed(1) + '%',
            levelClass: 'success',
            description: '处于运行状态的线程比例'
        });
        
        metrics.push({
            name: '阻塞线程比例',
            value: this.getBlockedPercentage(analysis) + '%',
            levelClass: this.getBlockedPercentage(analysis) > 20 ? 'danger' : 'success',
            description: '处于阻塞状态的线程比例'
        });
        
        return metrics;
    };
    
    this.hasResourceContention = function(insights) {
        return insights.insights && insights.insights.resourceContention && 
               insights.insights.resourceContention.contentionLevel !== 'low';
    };
    
    this.generateContentionHotspots = function(insights) {
        if (!insights.insights || !insights.insights.resourceContention || 
            !insights.insights.resourceContention.hotspots) {
            return [];
        }
        
        return insights.insights.resourceContention.hotspots.map(function(hotspot) {
            return {
                lockName: hotspot.method || '未知锁',
                threadCount: hotspot.count || 1,
                severityClass: hotspot.count > 5 ? 'danger' : hotspot.count > 2 ? 'warning' : 'info',
                lockType: '方法锁',
                description: '多个线程竞争此资源'
            };
        });
    };
    
    this.getContentionLevel = function(insights) {
        if (insights.insights && insights.insights.resourceContention) {
            return insights.insights.resourceContention.contentionLevel || 'low';
        }
        return 'low';
    };
    
    this.getContentionLevelClass = function(insights) {
        var level = this.getContentionLevel(insights);
        var classMap = {
            'low': 'success',
            'moderate': 'warning',
            'high': 'danger'
        };
        return classMap[level] || 'default';
    };
    
    this.getContentionDescription = function(insights) {
        var level = this.getContentionLevel(insights);
        var descMap = {
            'low': '资源争用较少，系统运行良好',
            'moderate': '存在一定程度的资源争用',
            'high': '资源争用严重，需要立即优化'
        };
        return descMap[level] || '未知';
    };
    
    this.hasHighCpuThreads = function(analysis) {
        // 简化实现：假设 RUNNABLE 状态的线程可能是高CPU线程
        return this.getThreadCountByStatus(analysis.threads, 'RUNNABLE') > 0;
    };
    
    this.generateHighCpuThreadsData = function(analysis) {
        return analysis.threads
            .filter(function(thread) { return thread.getStatus() === 'RUNNABLE'; })
            .slice(0, 5)
            .map(function(thread) {
                return {
                    threadName: thread.name,
                    cpuUsage: '未知',
                    status: thread.getStatus(),
                    statusClass: this.getStatusClass(thread.getStatus()),
                    topMethod: this.extractLockInfo(thread)
                };
            }.bind(this));
    };
    
    this.hasLongWaitingThreads = function(analysis) {
        return analysis.threads.some(function(thread) {
            return thread.getStatus() === 'WAITING' || thread.getStatus() === 'TIMED_WAITING';
        });
    };
    
    this.generateLongWaitingThreadsData = function(analysis) {
        return analysis.threads
            .filter(function(thread) { 
                return thread.getStatus() === 'WAITING' || thread.getStatus() === 'TIMED_WAITING'; 
            })
            .slice(0, 10)
            .map(function(thread) {
                return {
                    threadName: thread.name,
                    waitTime: '未知',
                    waitReason: thread.getStatus() === 'WAITING' ? '无限等待' : '定时等待',
                    waitObject: this.extractLockInfo(thread)
                };
            }.bind(this));
    };
    
    this.groupRecommendationsByCategory = function(recommendations) {
        var categories = {};
        
        recommendations.forEach(function(rec) {
            var category = rec.category || 'general';
            if (!categories[category]) {
                categories[category] = {
                    categoryName: this.getCategoryName(category),
                    icon: this.getCategoryIcon(category),
                    iconColor: this.getCategoryIconColor(category),
                    suggestions: []
                };
            }
            
            categories[category].suggestions.push({
                priority: rec.priority || 'medium',
                priorityClass: this.getPriorityClass(rec.priority),
                title: rec.title || '优化建议',
                description: rec.description || '暂无描述',
                hasActionItems: rec.actions && rec.actions.length > 0,
                actionItems: rec.actions || [],
                hasCodeExample: false,
                codeExample: ''
            });
        }.bind(this));
        
        return Object.values(categories);
    };
    
    this.getCategoryName = function(category) {
        var nameMap = {
            'synchronization': '同步优化',
            'threading': '线程优化',
            'performance': '性能优化',
            'general': '通用建议'
        };
        return nameMap[category] || category;
    };
    
    this.getCategoryIcon = function(category) {
        var iconMap = {
            'synchronization': 'lock',
            'threading': 'tasks',
            'performance': 'dashboard',
            'general': 'cog'
        };
        return iconMap[category] || 'cog';
    };
    
    this.getCategoryIconColor = function(category) {
        var colorMap = {
            'synchronization': 'danger',
            'threading': 'warning',
            'performance': 'success',
            'general': 'info'
        };
        return colorMap[category] || 'info';
    };
    
    this.getPriorityClass = function(priority) {
        var classMap = {
            'high': 'danger',
            'medium': 'warning',
            'low': 'info'
        };
        return classMap[priority] || 'info';
    };
    
    this.generateImprovementPlans = function(analysis, insights) {
        var plans = [];
        
        // 基于死锁生成改进方案
        if (analysis.deadlocks && analysis.deadlocks.length > 0) {
            plans.push({
                planTitle: '死锁问题解决方案',
                priority: 'high',
                priorityClass: 'danger',
                effortLevel: '中等',
                impactLevel: '高',
                problemDescription: '系统中检测到死锁，会导致线程永久阻塞，严重影响系统性能。',
                solutionDescription: '通过重新设计锁获取顺序和使用超时机制来解决死锁问题。',
                hasImplementationSteps: true,
                implementationSteps: [
                    '分析死锁涉及的所有线程和锁资源',
                    '重新设计锁的获取顺序，确保所有线程按相同顺序获取锁',
                    '使用 tryLock() 方法替代 synchronized，设置合理的超时时间',
                    '添加死锁检测和恢复机制'
                ],
                expectedBenefits: [
                    '消除死锁问题',
                    '提高系统稳定性',
                    '改善响应时间'
                ],
                hasRisks: true,
                risks: [
                    '修改锁顺序可能影响现有逻辑',
                    '需要充分测试确保不引入新问题'
                ],
                hasCodeChanges: false,
                codeChanges: []
            });
        }
        
        // 基于阻塞线程生成改进方案
        if (this.hasBlockedThreads(analysis)) {
            plans.push({
                planTitle: '线程阻塞优化方案',
                priority: 'medium',
                priorityClass: 'warning',
                effortLevel: '低',
                impactLevel: '中',
                problemDescription: '系统中存在较多阻塞线程，影响并发性能。',
                solutionDescription: '通过优化锁粒度和使用并发工具类来减少线程阻塞。',
                hasImplementationSteps: true,
                implementationSteps: [
                    '分析阻塞线程的具体原因',
                    '考虑使用读写锁替代互斥锁',
                    '减少临界区代码的执行时间',
                    '使用 ConcurrentHashMap 等并发集合'
                ],
                expectedBenefits: [
                    '减少线程阻塞时间',
                    '提高系统吞吐量',
                    '改善用户体验'
                ],
                hasRisks: false,
                risks: [],
                hasCodeChanges: false,
                codeChanges: []
            });
        }
        
        return plans;
    };
    
    this.generateCoreStatistics = function(analysis, insights) {
        var stats = [];
        
        stats.push({
            label: '线程总数',
            value: analysis.threads.length,
            hasUnit: true,
            unit: '个',
            hasPercentage: false
        });
        
        stats.push({
            label: 'RUNNABLE 线程',
            value: this.getThreadCountByStatus(analysis.threads, 'RUNNABLE'),
            hasUnit: true,
            unit: '个',
            hasPercentage: true,
            percentage: ((this.getThreadCountByStatus(analysis.threads, 'RUNNABLE') / analysis.threads.length) * 100).toFixed(1)
        });
        
        stats.push({
            label: 'BLOCKED 线程',
            value: this.getThreadCountByStatus(analysis.threads, 'BLOCKED'),
            hasUnit: true,
            unit: '个',
            hasPercentage: true,
            percentage: this.getBlockedPercentage(analysis)
        });
        
        stats.push({
            label: '死锁数量',
            value: analysis.deadlocks ? analysis.deadlocks.length : 0,
            hasUnit: true,
            unit: '个',
            hasPercentage: false
        });
        
        return stats;
    };
    
    this.generateAnomalyPatterns = function(analysis, insights) {
        var patterns = [];
        
        if (analysis.deadlocks && analysis.deadlocks.length > 0) {
            patterns.push({
                patternName: '死锁模式',
                description: '检测到线程间相互等待导致的死锁',
                severityClass: 'danger',
                icon: 'exclamation-sign',
                hasAffectedThreads: true,
                affectedThreadCount: analysis.deadlocks.length * 2 // 估算
            });
        }
        
        var blockedRatio = this.getBlockedPercentage(analysis) / 100;
        if (blockedRatio > 0.3) {
            patterns.push({
                patternName: '高阻塞模式',
                description: '大量线程处于阻塞状态，可能存在锁竞争',
                severityClass: 'warning',
                icon: 'pause',
                hasAffectedThreads: true,
                affectedThreadCount: this.getBlockedThreadCount(analysis)
            });
        }
        
        return patterns;
    };
    
    this.hasAnomalies = function(analysis, insights) {
        return (analysis.deadlocks && analysis.deadlocks.length > 0) || 
               (this.getBlockedPercentage(analysis) > 30);
    };
    
    this.generateQuickNavItems = function(analysis, insights) {
        var items = [];
        
        items.push({
            icon: 'dashboard',
            iconColor: 'primary',
            title: '健康评分',
            description: '查看系统整体健康状况',
            hasAction: true,
            actionClass: 'primary',
            actionText: '查看详情',
            actionFunction: 'scrollToSection("health-score")'
        });
        
        if (analysis.deadlocks && analysis.deadlocks.length > 0) {
            items.push({
                icon: 'exclamation-triangle',
                iconColor: 'danger',
                title: '死锁问题',
                description: '发现死锁，需要立即处理',
                hasAction: true,
                actionClass: 'danger',
                actionText: '立即查看',
                actionFunction: 'scrollToSection("critical-issues")'
            });
        }
        
        items.push({
            icon: 'stats',
            iconColor: 'info',
            title: '线程统计',
            description: '查看详细的线程状态分布',
            hasAction: true,
            actionClass: 'info',
            actionText: '查看统计',
            actionFunction: 'scrollToSection("thread-statistics")'
        });
        
        items.push({
            icon: 'lightbulb',
            iconColor: 'warning',
            title: '优化建议',
            description: '获取性能优化建议',
            hasAction: true,
            actionClass: 'warning',
            actionText: '查看建议',
            actionFunction: 'scrollToSection("optimization")'
        });
        
        return items;
    };
    
    this.renderError = function(message) {
        var html = '<div class="alert alert-danger"><h4>专业报告渲染错误</h4><p>' + message + '</p></div>';
        this.target.append(html);
    };
};

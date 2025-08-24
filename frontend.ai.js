/*
AI Enhanced Frontend for Java Thread Dump Analyzer
Copyright 2025 - Real AWS Bedrock Integration
*/

// 等待页面完全加载后再初始化 AI 功能
$(document).ready(function() {
    console.log('🤖 初始化 AI 增强功能...');
    
    // 检查依赖是否加载
    if (typeof jtda === 'undefined') {
        console.error('❌ jtda 核心模块未加载');
        return;
    }
    
    if (typeof executeAnalysis !== 'function') {
        console.error('❌ executeAnalysis 函数未定义');
        return;
    }
    
    // 保存原始函数
    window.originalExecuteAnalysis = executeAnalysis;
    
    // AI 增强的分析执行函数
    function executeAnalysisWithAI(dumpId) {
        var text = $('#' + dumpId + '_dumpInput').val();
        
        if (/^(\s*(http(s)?:\/\/[^\/]+\/\S*))*\s*$/g.test(text)) {
            importFromUrl(dumpId, text.trim()); 
            return;
        }
        
        var analysis = dumpAnalysis[dumpId];
        analysis.analyze(text);
        if (jtdaDebug) {
            console.debug(analysis);
        }
        var target = $('#' + dumpId + '_dump div.results');
        target.empty();
        if (analysis.threads.length === 0) {
            target.append(Mustache.render($('#tmpl-alert').html(), {level: 'danger', message: 'No threads found in the thread dump'})); 
        }
        else {
            $('#' + dumpId + '_input').hide();
            $('#' + dumpId + '_inputpeak').show();
            $('#' + dumpId + '_inputpeak .sneakpeak').val(text.trim().split('\n').slice(0, 5).join('\n')+'\n[...]');
            
            // 检查 AI 功能状态
            var aiEnabled = $('#ai-toggle').prop('checked');
            var awsConfigured = typeof awsConfig !== 'undefined' && awsConfig.isConfigured();
            
            if (aiEnabled) {
                // 显示 AI 分析加载状态
                var loadingMessage = awsConfigured ? 
                    '<i class="glyphicon glyphicon-refresh glyphicon-spin"></i> ' +
                    '<strong>AWS Bedrock Claude 正在分析中...</strong> 正在使用真实的 AI 进行深度分析，请稍候' :
                    '<i class="glyphicon glyphicon-refresh glyphicon-spin"></i> ' +
                    '<strong>AI 正在分析中...</strong> 使用智能分析模式';
                    
                target.append('<div id="ai-loading-' + dumpId + '" class="alert alert-info">' + loadingMessage + '</div>');
                
                // 选择 AI 分析器
                var analyzer = null;
                var aiMode = 'unknown';
                
                if (awsConfigured) {
                    // 尝试使用完整的 AWS Bedrock 客户端
                    if (typeof jtda.aws !== 'undefined' && jtda.aws.bedrock) {
                        analyzer = new jtda.aws.bedrock.Analyzer(awsConfig.getConfig());
                        aiMode = 'bedrock-full';
                        console.log('🤖 使用完整的 AWS Bedrock Claude 3.5 Sonnet');
                    } else if (typeof jtda.aws !== 'undefined' && jtda.aws.simple) {
                        // 回退到简化的 AWS 客户端
                        analyzer = new jtda.aws.simple.Analyzer(awsConfig.getConfig());
                        aiMode = 'bedrock-simple';
                        console.log('🤖 使用简化的 AWS Bedrock 客户端（模拟模式）');
                    }
                }
                
                if (!analyzer && typeof jtda.ai !== 'undefined' && jtda.ai.Analyzer) {
                    // 最后回退到纯模拟分析器
                    analyzer = new jtda.ai.Analyzer();
                    aiMode = 'mock';
                    console.log('🤖 使用模拟 AI 分析器');
                }
                
                if (analyzer) {
                    analyzer.analyzeWithAI(analysis, function(error, enhancedAnalysis) {
                        // 移除加载提示
                        $('#ai-loading-' + dumpId).remove();
                        
                        if (error) {
                            console.warn('AI analysis failed:', error);
                            var errorMessage = awsConfigured ? 
                                'AWS Bedrock AI 分析失败，使用标准分析模式' :
                                'AI 分析暂时不可用，使用标准分析模式';
                            
                            target.prepend('<div class="alert alert-warning">' +
                                          '<i class="glyphicon glyphicon-warning-sign"></i> ' +
                                          errorMessage + 
                                          '<br><small>错误详情: ' + error.message + '</small></div>');
                            
                            // 使用标准渲染器
                            new jtda.render.Renderer(target, renderConfig).render(analysis);
                        } else {
                            // 显示 AI 增强成功提示
                            var successMessage = '';
                            switch (aiMode) {
                                case 'bedrock-full':
                                    successMessage = '<strong>AWS Bedrock Claude 分析完成！</strong> 已使用真实的 AI 进行智能增强分析';
                                    break;
                                case 'bedrock-simple':
                                    successMessage = '<strong>AWS Bedrock 分析完成！</strong> 已使用简化模式进行智能分析（需要后端代理支持完整功能）';
                                    break;
                                case 'mock':
                                default:
                                    successMessage = '<strong>AI 分析完成！</strong> 已使用模拟 AI 进行增强分析';
                                    break;
                            }
                                
                            target.prepend('<div class="alert alert-success alert-dismissible">' +
                                          '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                                          '<i class="glyphicon glyphicon-ok-circle"></i> ' +
                                          successMessage + '</div>');
                            
                            // 使用 AI 增强渲染器
                            if (typeof jtda.ai.render !== 'undefined' && jtda.ai.render.EnhancedRenderer) {
                                new jtda.ai.render.EnhancedRenderer(target, renderConfig).render(enhancedAnalysis || analysis);
                            } else {
                                new jtda.render.Renderer(target, renderConfig).render(enhancedAnalysis || analysis);
                            }
                        }
                        
                        $('#'+dumpId+'_dump').scrollspy({ target: '#'+dumpId+'_navbar', offset: 50 });
                    });
                } else {
                    // 没有可用的 AI 分析器
                    $('#ai-loading-' + dumpId).remove();
                    target.prepend('<div class="alert alert-warning">' +
                                  '<i class="glyphicon glyphicon-warning-sign"></i> ' +
                                  'AI 模块未加载，使用标准分析模式</div>');
                    new jtda.render.Renderer(target, renderConfig).render(analysis);
                    $('#'+dumpId+'_dump').scrollspy({ target: '#'+dumpId+'_navbar', offset: 50 });
                }
            } else {
                // AI 功能被禁用
                target.prepend('<div class="alert alert-info">' +
                              '<i class="glyphicon glyphicon-info-sign"></i> ' +
                              'AI 分析已禁用，使用标准分析模式</div>');
                new jtda.render.Renderer(target, renderConfig).render(analysis);
                $('#'+dumpId+'_dump').scrollspy({ target: '#'+dumpId+'_navbar', offset: 50 });
            }
        }
    }

    // 替换为 AI 增强版本
    window.executeAnalysis = executeAnalysisWithAI;
    
    // AI 功能切换
    function toggleAIAnalysis() {
        var aiEnabled = $('#ai-toggle').prop('checked');
        var statusText = $('#ai-status-text');
        
        if (aiEnabled) {
            window.executeAnalysis = executeAnalysisWithAI;
            statusText.text('AI 增强分析已启用');
            console.log('🤖 AI 分析已启用');
            
            // 检查 AWS 配置状态
            if (typeof awsConfig !== 'undefined' && awsConfig.isConfigured()) {
                statusText.text('AWS Bedrock AI 已启用');
            } else {
                statusText.text('AI 已启用（智能模式）');
            }
        } else {
            window.executeAnalysis = window.originalExecuteAnalysis || executeAnalysisWithAI;
            statusText.text('标准分析模式');
            console.log('📊 AI 分析已禁用');
        }
    }

    // 更新 AI 状态显示
    function updateAIStatus() {
        var statusText = $('#ai-status-text');
        var configButton = $('#aws-config-btn');
        
        if (typeof awsConfig !== 'undefined' && awsConfig.isConfigured()) {
            statusText.text('AWS Bedrock 已配置').removeClass('text-warning').addClass('text-success');
            if (configButton.length) {
                configButton.removeClass('btn-warning').addClass('btn-success').text('重新配置 AWS');
            }
        } else {
            statusText.text('智能分析模式').removeClass('text-success').addClass('text-info');
            if (configButton.length) {
                configButton.removeClass('btn-success').addClass('btn-warning').text('配置 AWS Bedrock');
            }
        }
    }

    // 添加 AI 功能控制面板到导航栏
    var aiControlPanel = `
    <li class="dropdown">
        <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button">
            <i class="glyphicon glyphicon-flash"></i> AI 分析 <span class="caret"></span>
        </a>
        <ul class="dropdown-menu">
            <li class="dropdown-header">AI 功能控制</li>
            <li>
                <a href="#" onclick="return false;">
                    <label class="checkbox-inline" style="margin: 0;">
                        <input type="checkbox" id="ai-toggle" checked> 启用 AI 分析
                    </label>
                </a>
            </li>
            <li class="divider"></li>
            <li class="dropdown-header">状态信息</li>
            <li><a href="#" onclick="return false;"><small id="ai-status-text">检查中...</small></a></li>
            <li class="divider"></li>
            <li>
                <a href="#" id="aws-config-btn" data-toggle="modal" data-target="#aws-config-modal">
                    <i class="glyphicon glyphicon-cog"></i> 配置 AWS Bedrock
                </a>
            </li>
        </ul>
    </li>`;
    
    $('.navbar-nav').append(aiControlPanel);
    
    // 绑定事件
    $('#ai-toggle').change(toggleAIAnalysis);
    
    // 初始化状态
    setTimeout(function() {
        updateAIStatus();
        toggleAIAnalysis();
    }, 500);
    
    // 监听 AWS 配置变化
    $(document).on('aws-config-updated', function() {
        updateAIStatus();
    });
    
    // 显示 AI 功能介绍
    console.log('🤖 AI 增强功能已加载！');
    console.log('✨ 功能包括：');
    console.log('  - AWS Bedrock Claude 3.5 Sonnet 集成');
    console.log('  - 智能健康评分');
    console.log('  - 自动问题诊断');
    console.log('  - 性能优化建议');
    console.log('  - 增强可视化图表');
    console.log('🔧 请在导航栏中配置 AWS Bedrock 以启用真实 AI 分析');
});

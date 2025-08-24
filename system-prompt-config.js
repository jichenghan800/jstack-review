/*
System Prompt Configuration for AI Analysis
Copyright 2025 - Customizable AI Analysis Prompts
*/

$(document).ready(function() {
    console.log('⚙️ 加载 System Prompt 配置...');
    
    // 预设的 system prompt 模板
    const PROMPT_TEMPLATES = {
        'professional': {
            name: '专业分析报告',
            description: '基于用户定制的专业分析模板，输出结构化详细报告',
            prompt: `你是一个专业的 Java 性能分析专家。请帮我精细分析下面这个通过 jstack -l 生成的 Java 线程转储文件，并提供以下内容，要求用中文回答，格式清晰易于理解：

系统健康评分（0-100分）
综合当前线程状态、死锁情况、资源争用及阻塞情况给出一个整体健康评分。

关键问题识别
明确指出是否存在死锁（Deadlock）
具体说明存在的阻塞线程（BLOCKED状态）及其原因
资源争用（锁竞争）情况分析
CPU占用异常线程分析

性能优化建议
针对发现的问题给出具体、实用的优化建议
包括锁优化、线程池调整、代码重构等角度

线程状态统计分析（请以清晰的数据列表形式展示）
总线程数
各线程状态数量与比例，如 RUNNABLE、BLOCKED、WAITING、TIMED_WAITING、NEW、TERMINATED
是否存在死锁以及死锁涉及的线程数量
主要阻塞线程数量及其锁资源详情
等待时间较长的线程列表（如等待超过10秒）
CPU占用较高的线程列表

具体改进方案
针对关键线程或模块，详细给出可执行的改进方案
包括代码层面、配置调整和最佳实践建议

统计类目建议（便于结构化展示）
请在分析报告中包含以下统计类目及对应数据说明：
线程总数：当前所有线程的总数
各状态线程数及比例：例如 RUNNABLE、BLOCKED、WAITING、TIMED_WAITING、NEW、TERMINATED 的线程数量和百分比
死锁检测结果：是否存在死锁，涉及的线程和锁信息
阻塞线程详情：主要阻塞线程及其所在锁资源的详细信息
长时间等待线程：等待时间超过阈值（例如10秒）的线程列表
高CPU消耗线程：处于 RUNNABLE 状态且CPU占用较高的线程列表
锁竞争热点：锁竞争频繁的锁及相关线程信息
线程栈异常模式：发现的死循环、重复调用等异常堆栈模式

请确保输出内容结构清晰，方便快速定位问题和制定改进策略。`
        },
        'general': {
            name: '通用分析',
            description: '全面的线程转储分析，包含所有方面',
            prompt: `你是一个专业的 Java 性能分析专家。请分析这个线程转储文件，提供：
1. 系统健康评分 (0-100分)
2. 关键问题识别 (死锁、阻塞、资源争用)
3. 性能优化建议
4. 线程状态分析
5. 具体的改进方案

请用中文回答，格式要清晰易懂。`
        },
        'performance': {
            name: '性能优化重点',
            description: '专注于性能瓶颈和优化建议',
            prompt: `你是一个 Java 性能优化专家。请重点分析这个线程转储的性能问题：
1. 识别性能瓶颈和热点方法
2. 分析线程池配置是否合理
3. 检查资源争用和锁竞争
4. 提供具体的性能优化建议
5. 评估系统并发处理能力

重点关注可执行的优化方案，用中文详细说明。`
        },
        'troubleshooting': {
            name: '故障排查',
            description: '专注于问题诊断和故障排除',
            prompt: `你是一个 Java 故障诊断专家。请帮助排查这个线程转储中的问题：
1. 识别所有异常状态和错误
2. 分析死锁和阻塞的根本原因
3. 检查线程泄漏和资源泄漏
4. 提供故障排除步骤
5. 给出预防措施建议

请提供详细的诊断过程和解决方案，用中文回答。`
        },
        'security': {
            name: '安全分析',
            description: '关注安全相关的线程和资源问题',
            prompt: `你是一个 Java 安全分析专家。请从安全角度分析这个线程转储：
1. 检查是否有安全相关的线程阻塞
2. 分析资源访问控制问题
3. 识别潜在的安全漏洞
4. 检查权限验证相关的线程状态
5. 提供安全加固建议

重点关注安全风险和防护措施，用中文详细说明。`
        },
        'custom': {
            name: '自定义',
            description: '用户自定义的分析提示词',
            prompt: ''
        }
    };
    
    // 当前配置
    var currentConfig = {
        template: 'general',
        customPrompt: '',
        analysisMode: 'comprehensive', // comprehensive, focused, quick
        outputFormat: 'detailed', // detailed, summary, technical
        language: 'chinese'
    };
    
    // 创建配置模态框
    var promptConfigModalHtml = `
    <div class="modal fade" id="system-prompt-modal" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                    <h4 class="modal-title">
                        <i class="glyphicon glyphicon-cog"></i> System Prompt 配置
                    </h4>
                </div>
                <div class="modal-body">
                    <!-- 说明 -->
                    <div class="alert alert-info">
                        <h5><i class="glyphicon glyphicon-info-sign"></i> 关于 System Prompt</h5>
                        <p>System Prompt 是指导 AI 分析的核心指令，决定了 AI 的分析角度、重点和输出格式。</p>
                        <p>通过自定义 System Prompt，您可以让 AI 专注于特定的分析领域或使用特定的分析方法。</p>
                    </div>
                    
                    <!-- 模板选择 -->
                    <div class="panel panel-default">
                        <div class="panel-heading">
                            <h5 class="panel-title">选择分析模板</h5>
                        </div>
                        <div class="panel-body">
                            <div class="row" id="template-selection">
                                <!-- 模板选项将在这里生成 -->
                            </div>
                        </div>
                    </div>
                    
                    <!-- 自定义 Prompt -->
                    <div class="panel panel-default">
                        <div class="panel-heading">
                            <h5 class="panel-title">System Prompt 内容</h5>
                        </div>
                        <div class="panel-body">
                            <textarea class="form-control" rows="8" id="system-prompt-text" 
                                      placeholder="输入您的自定义 System Prompt..."></textarea>
                            <div class="help-block">
                                <small>
                                    <strong>提示：</strong> 好的 System Prompt 应该包含：分析目标、关注重点、输出格式要求、语言偏好等。
                                </small>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 高级选项 -->
                    <div class="panel panel-default">
                        <div class="panel-heading">
                            <h5 class="panel-title">高级选项</h5>
                        </div>
                        <div class="panel-body">
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="form-group">
                                        <label>分析模式</label>
                                        <select class="form-control" id="analysis-mode">
                                            <option value="comprehensive">全面分析</option>
                                            <option value="focused">重点分析</option>
                                            <option value="quick">快速分析</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="form-group">
                                        <label>输出格式</label>
                                        <select class="form-control" id="output-format">
                                            <option value="detailed">详细报告</option>
                                            <option value="summary">摘要格式</option>
                                            <option value="technical">技术格式</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="form-group">
                                        <label>输出语言</label>
                                        <select class="form-control" id="output-language">
                                            <option value="chinese">中文</option>
                                            <option value="english">English</option>
                                            <option value="mixed">中英混合</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 预览 -->
                    <div class="panel panel-success">
                        <div class="panel-heading">
                            <h5 class="panel-title">最终 System Prompt 预览</h5>
                        </div>
                        <div class="panel-body">
                            <div id="prompt-preview" style="background: #f8f9fa; padding: 15px; border-radius: 5px; font-family: monospace; white-space: pre-wrap; max-height: 200px; overflow-y: auto;">
                                <!-- 预览内容 -->
                            </div>
                        </div>
                    </div>
                    
                    <div id="prompt-status" class="alert" style="display: none;"></div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-warning" id="reset-prompt">重置为默认</button>
                    <button type="button" class="btn btn-primary" id="test-prompt">测试 Prompt</button>
                    <button type="button" class="btn btn-success" id="save-prompt">保存配置</button>
                </div>
            </div>
        </div>
    </div>`;
    
    // 添加模态框到页面
    $('body').append(promptConfigModalHtml);
    
    // 生成模板选择界面
    function generateTemplateSelection() {
        var html = '';
        Object.keys(PROMPT_TEMPLATES).forEach(function(key) {
            var template = PROMPT_TEMPLATES[key];
            var isActive = currentConfig.template === key ? 'active' : '';
            
            html += `
            <div class="col-md-6">
                <div class="template-card ${isActive}" data-template="${key}">
                    <h6><strong>${template.name}</strong></h6>
                    <p><small>${template.description}</small></p>
                </div>
            </div>`;
        });
        
        $('#template-selection').html(html);
        
        // 添加样式
        $('<style>').text(`
            .template-card {
                border: 2px solid #e9ecef;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 15px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .template-card:hover {
                border-color: #007cba;
                background: #f8f9fa;
            }
            .template-card.active {
                border-color: #28a745;
                background: #d4edda;
            }
        `).appendTo('head');
    }
    
    // 更新 prompt 预览
    function updatePromptPreview() {
        var basePrompt = '';
        
        if (currentConfig.template !== 'custom') {
            basePrompt = PROMPT_TEMPLATES[currentConfig.template].prompt;
        } else {
            basePrompt = currentConfig.customPrompt;
        }
        
        // 添加高级选项到 prompt
        var enhancedPrompt = basePrompt;
        
        if (currentConfig.analysisMode === 'focused') {
            enhancedPrompt += '\\n\\n重点关注最关键的问题，简化次要信息。';
        } else if (currentConfig.analysisMode === 'quick') {
            enhancedPrompt += '\\n\\n请提供快速分析，突出最重要的发现。';
        }
        
        if (currentConfig.outputFormat === 'summary') {
            enhancedPrompt += '\\n\\n请以摘要格式输出，突出关键点。';
        } else if (currentConfig.outputFormat === 'technical') {
            enhancedPrompt += '\\n\\n请使用技术术语，提供详细的技术分析。';
        }
        
        if (currentConfig.language === 'english') {
            enhancedPrompt += '\\n\\nPlease respond in English.';
        } else if (currentConfig.language === 'mixed') {
            enhancedPrompt += '\\n\\n可以使用中英文混合，技术术语用英文。';
        }
        
        $('#prompt-preview').text(enhancedPrompt);
    }
    
    // 绑定事件
    $(document).on('click', '.template-card', function() {
        $('.template-card').removeClass('active');
        $(this).addClass('active');
        
        var template = $(this).data('template');
        currentConfig.template = template;
        
        if (template !== 'custom') {
            $('#system-prompt-text').val(PROMPT_TEMPLATES[template].prompt);
        } else {
            $('#system-prompt-text').val(currentConfig.customPrompt);
        }
        
        updatePromptPreview();
    });
    
    $('#system-prompt-text').on('input', function() {
        if (currentConfig.template === 'custom') {
            currentConfig.customPrompt = $(this).val();
        }
        updatePromptPreview();
    });
    
    $('#analysis-mode, #output-format, #output-language').on('change', function() {
        currentConfig.analysisMode = $('#analysis-mode').val();
        currentConfig.outputFormat = $('#output-format').val();
        currentConfig.language = $('#output-language').val();
        updatePromptPreview();
    });
    
    $('#reset-prompt').click(function() {
        currentConfig = {
            template: 'general',
            customPrompt: '',
            analysisMode: 'comprehensive',
            outputFormat: 'detailed',
            language: 'chinese'
        };
        
        loadCurrentConfig();
        showPromptStatus('info', '已重置为默认配置');
    });
    
    $('#test-prompt').click(function() {
        var prompt = $('#prompt-preview').text();
        if (prompt.trim()) {
            showPromptStatus('success', 'Prompt 格式正确，可以使用');
        } else {
            showPromptStatus('warning', '请输入有效的 System Prompt');
        }
    });
    
    $('#save-prompt').click(function() {
        try {
            localStorage.setItem('system-prompt-config', JSON.stringify(currentConfig));
            window.systemPromptConfig = currentConfig;
            showPromptStatus('success', 'System Prompt 配置已保存');
            
            setTimeout(function() {
                $('#system-prompt-modal').modal('hide');
            }, 1500);
        } catch (e) {
            showPromptStatus('danger', '保存失败: ' + e.message);
        }
    });
    
    // 加载当前配置
    function loadCurrentConfig() {
        generateTemplateSelection();
        
        $('#analysis-mode').val(currentConfig.analysisMode);
        $('#output-format').val(currentConfig.outputFormat);
        $('#output-language').val(currentConfig.language);
        
        if (currentConfig.template !== 'custom') {
            $('#system-prompt-text').val(PROMPT_TEMPLATES[currentConfig.template].prompt);
        } else {
            $('#system-prompt-text').val(currentConfig.customPrompt);
        }
        
        updatePromptPreview();
    }
    
    // 显示状态消息
    function showPromptStatus(type, message) {
        var statusDiv = $('#prompt-status');
        statusDiv.removeClass('alert-success alert-danger alert-warning alert-info')
                 .addClass('alert-' + type)
                 .html('<i class="glyphicon glyphicon-info-sign"></i> ' + message)
                 .show();
    }
    
    // 模态框显示时初始化
    $('#system-prompt-modal').on('show.bs.modal', function() {
        loadCurrentConfig();
    });
    
    // 从本地存储加载配置
    try {
        var saved = localStorage.getItem('system-prompt-config');
        if (saved) {
            currentConfig = Object.assign(currentConfig, JSON.parse(saved));
        }
    } catch (e) {
        console.warn('加载 System Prompt 配置失败:', e);
    }
    
    // 导出配置供其他模块使用
    window.systemPromptConfig = currentConfig;
    window.getSystemPrompt = function() {
        var basePrompt = '';
        
        if (currentConfig.template !== 'custom') {
            basePrompt = PROMPT_TEMPLATES[currentConfig.template].prompt;
        } else {
            basePrompt = currentConfig.customPrompt;
        }
        
        // 添加高级选项
        var enhancedPrompt = basePrompt;
        
        if (currentConfig.analysisMode === 'focused') {
            enhancedPrompt += '\\n\\n重点关注最关键的问题，简化次要信息。';
        } else if (currentConfig.analysisMode === 'quick') {
            enhancedPrompt += '\\n\\n请提供快速分析，突出最重要的发现。';
        }
        
        if (currentConfig.outputFormat === 'summary') {
            enhancedPrompt += '\\n\\n请以摘要格式输出，突出关键点。';
        } else if (currentConfig.outputFormat === 'technical') {
            enhancedPrompt += '\\n\\n请使用技术术语，提供详细的技术分析。';
        }
        
        if (currentConfig.language === 'english') {
            enhancedPrompt += '\\n\\nPlease respond in English.';
        } else if (currentConfig.language === 'mixed') {
            enhancedPrompt += '\\n\\n可以使用中英文混合，技术术语用英文。';
        }
        
        return enhancedPrompt;
    };
    
    console.log('✅ System Prompt 配置已加载');
});

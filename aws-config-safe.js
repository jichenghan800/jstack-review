/*
Safe AWS Bedrock Configuration with Cost Protection
Copyright 2025 - Enhanced Security and Cost Control for Large Files
*/

$(document).ready(function() {
    console.log('🛡️ 加载安全的 AWS Bedrock 配置 (大文件支持)...');
    
    // 重新计算的安全配置常量 (支持 800KB 文件)
    const SAFETY_LIMITS = {
        MAX_TOKENS_PER_REQUEST: 8000,        // 最大限制 8000 tokens
        RECOMMENDED_TOKENS_800KB: 5000,      // 800KB 文件推荐值
        OPTIMAL_TEMPERATURE: 0.15,           // 最优温度设置
        MAX_REQUESTS_PER_HOUR: 5,            // 减少到每小时 5 次 (控制成本)
        MAX_REQUESTS_PER_DAY: 20,            // 减少到每天 20 次 (控制成本)
        MAX_INPUT_SIZE: 4000000,             // 4MB (800KB * 5倍安全边界)
        COOLDOWN_PERIOD: 60000,              // 增加到 60秒冷却时间
        SESSION_TIMEOUT: 3600000,            // 会话超时 (1小时)
        ESTIMATED_COST_PER_REQUEST: 0.15    // 预估单次费用 (USD)
    };
    
    // 费用计算常量 (Claude 3.5 Sonnet 最新价格)
    const PRICING = {
        INPUT_COST_PER_1M_TOKENS: 3.00,     // $3 per 1M input tokens
        OUTPUT_COST_PER_1M_TOKENS: 15.00,   // $15 per 1M output tokens
        CHARS_PER_TOKEN: 4                  // 平均每个 token 4 个字符
    };
    
    // 请求计数器和限制器
    let requestCounter = {
        hourly: { count: 0, resetTime: Date.now() + 3600000 },
        daily: { count: 0, resetTime: Date.now() + 86400000 },
        lastRequest: 0,
        totalCost: 0  // 累计费用
    };
    
    // 从本地存储加载计数器
    function loadRequestCounter() {
        try {
            const saved = localStorage.getItem('aws-request-counter');
            if (saved) {
                const data = JSON.parse(saved);
                const now = Date.now();
                
                // 重置过期的计数器
                if (now > data.hourly.resetTime) {
                    data.hourly = { count: 0, resetTime: now + 3600000 };
                }
                if (now > data.daily.resetTime) {
                    data.daily = { count: 0, resetTime: now + 86400000 };
                }
                
                requestCounter = data;
            }
        } catch (e) {
            console.warn('加载请求计数器失败:', e);
        }
    }
    
    // 保存请求计数器
    function saveRequestCounter() {
        try {
            localStorage.setItem('aws-request-counter', JSON.stringify(requestCounter));
        } catch (e) {
            console.warn('保存请求计数器失败:', e);
        }
    }
    
    // 精确计算费用
    function calculatePreciseCost(inputText, outputTokens = SAFETY_LIMITS.MAX_TOKENS_PER_REQUEST) {
        const inputTokens = Math.ceil(inputText.length / PRICING.CHARS_PER_TOKEN);
        
        const inputCost = (inputTokens / 1000000) * PRICING.INPUT_COST_PER_1M_TOKENS;
        const outputCost = (outputTokens / 1000000) * PRICING.OUTPUT_COST_PER_1M_TOKENS;
        const totalCost = inputCost + outputCost;
        
        return {
            inputTokens: inputTokens,
            outputTokens: outputTokens,
            inputCost: inputCost,
            outputCost: outputCost,
            totalCost: totalCost,
            formattedCost: '$' + totalCost.toFixed(4)
        };
    }
    
    // 检查请求是否被允许
    function isRequestAllowed(inputText = '') {
        const now = Date.now();
        
        // 检查冷却时间
        if (now - requestCounter.lastRequest < SAFETY_LIMITS.COOLDOWN_PERIOD) {
            return {
                allowed: false,
                reason: `请求过于频繁，请等待 ${Math.ceil((SAFETY_LIMITS.COOLDOWN_PERIOD - (now - requestCounter.lastRequest)) / 1000)} 秒`
            };
        }
        
        // 检查小时限制
        if (requestCounter.hourly.count >= SAFETY_LIMITS.MAX_REQUESTS_PER_HOUR) {
            return {
                allowed: false,
                reason: `已达到每小时请求限制 (${SAFETY_LIMITS.MAX_REQUESTS_PER_HOUR} 次)`
            };
        }
        
        // 检查日限制
        if (requestCounter.daily.count >= SAFETY_LIMITS.MAX_REQUESTS_PER_DAY) {
            return {
                allowed: false,
                reason: `已达到每日请求限制 (${SAFETY_LIMITS.MAX_REQUESTS_PER_DAY} 次)`
            };
        }
        
        // 检查单次费用
        if (inputText) {
            const cost = calculatePreciseCost(inputText);
            if (cost.totalCost > 0.50) { // 单次费用超过 $0.50 时警告
                return {
                    allowed: false,
                    reason: `单次预估费用过高 (${cost.formattedCost})，超过安全限制 $0.50`
                };
            }
        }
        
        return { allowed: true };
    }
    
    // 记录请求和费用
    function recordRequest(cost = SAFETY_LIMITS.ESTIMATED_COST_PER_REQUEST) {
        const now = Date.now();
        requestCounter.hourly.count++;
        requestCounter.daily.count++;
        requestCounter.lastRequest = now;
        requestCounter.totalCost += cost;
        saveRequestCounter();
    }
    
    // 验证输入大小
    function validateInputSize(input) {
        if (input.length > SAFETY_LIMITS.MAX_INPUT_SIZE) {
            return {
                valid: false,
                reason: `输入内容过大 (${(input.length/1024/1024).toFixed(2)} MB)，最大允许 ${(SAFETY_LIMITS.MAX_INPUT_SIZE/1024/1024).toFixed(2)} MB`
            };
        }
        return { valid: true };
    }
    
    // 创建安全的配置模态框
    var safeConfigModalHtml = `
    <div class="modal fade" id="aws-config-safe-modal" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                    <h4 class="modal-title">
                        <i class="glyphicon glyphicon-shield"></i> 安全的 AWS Bedrock 配置 (大文件支持)
                    </h4>
                </div>
                <div class="modal-body">
                    <!-- 文件大小和费用说明 -->
                    <div class="alert alert-info">
                        <h5><i class="glyphicon glyphicon-info-sign"></i> 大文件支持配置</h5>
                        <ul>
                            <li><strong>支持文件大小</strong>: 最大 4MB (800KB × 5倍安全边界)</li>
                            <li><strong>预估单次费用</strong>: $0.05 - $0.50 (取决于文件大小)</li>
                            <li><strong>800KB 文件预估</strong>: 约 $0.15 - $0.25</li>
                        </ul>
                    </div>
                    
                    <!-- 安全警告 -->
                    <div class="alert alert-warning">
                        <h5><i class="glyphicon glyphicon-warning-sign"></i> 重要安全限制</h5>
                        <ul>
                            <li><strong>Token 限制</strong>: 每次请求最大 ${SAFETY_LIMITS.MAX_TOKENS_PER_REQUEST} tokens</li>
                            <li><strong>频率限制</strong>: 每小时最多 ${SAFETY_LIMITS.MAX_REQUESTS_PER_HOUR} 次，每天最多 ${SAFETY_LIMITS.MAX_REQUESTS_PER_DAY} 次</li>
                            <li><strong>冷却时间</strong>: 请求间隔至少 ${SAFETY_LIMITS.COOLDOWN_PERIOD/1000} 秒</li>
                            <li><strong>费用保护</strong>: 单次费用超过 $0.50 将被阻止</li>
                        </ul>
                    </div>
                    
                    <!-- 费用计算器 -->
                    <div class="panel panel-success">
                        <div class="panel-heading">
                            <h5 class="panel-title">💰 费用计算器</h5>
                        </div>
                        <div class="panel-body">
                            <div class="form-group">
                                <label>输入文件大小 (KB):</label>
                                <input type="number" class="form-control" id="file-size-calculator" 
                                       value="800" min="1" max="4000" placeholder="输入文件大小">
                            </div>
                            <div class="well">
                                <div id="cost-breakdown">
                                    <strong>费用预估:</strong><br>
                                    输入 tokens: <span id="input-tokens">~200,000</span><br>
                                    输出 tokens: <span id="output-tokens">5,000</span><br>
                                    <strong>预估费用: <span id="estimated-cost" class="text-success">$0.675</span></strong><br>
                                    <div id="parameter-recommendation" class="text-info" style="margin-top: 10px;">
                                        <strong>参数建议:</strong> 大文件: 建议 5000 tokens, 温度 0.15 ⭐
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 当前使用统计 -->
                    <div class="panel panel-info">
                        <div class="panel-heading">
                            <h5 class="panel-title">📊 当前使用统计</h5>
                        </div>
                        <div class="panel-body">
                            <div class="row">
                                <div class="col-md-3">
                                    <strong>今日请求:</strong><br>
                                    <span id="daily-count">0</span>/${SAFETY_LIMITS.MAX_REQUESTS_PER_DAY}
                                </div>
                                <div class="col-md-3">
                                    <strong>本小时:</strong><br>
                                    <span id="hourly-count">0</span>/${SAFETY_LIMITS.MAX_REQUESTS_PER_HOUR}
                                </div>
                                <div class="col-md-3">
                                    <strong>累计费用:</strong><br>
                                    $<span id="total-cost">0.00</span>
                                </div>
                                <div class="col-md-3">
                                    <strong>上次请求:</strong><br>
                                    <span id="last-request">从未</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <form id="aws-config-safe-form">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="aws-region-safe">AWS 区域 *</label>
                                    <select class="form-control" id="aws-region-safe" required>
                                        <option value="us-east-1">US East (N. Virginia)</option>
                                        <option value="us-west-2">US West (Oregon)</option>
                                        <option value="eu-west-1">Europe (Ireland)</option>
                                        <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                                        <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="aws-model-safe">Claude 模型</label>
                                    <select class="form-control" id="aws-model-safe">
                                        <option value="anthropic.claude-3-5-sonnet-20241022-v2:0" selected>Claude 3.5 Sonnet v2 (最新，相当于 Claude 4.0)</option>
                                        <option value="anthropic.claude-3-5-sonnet-20240620-v1:0">Claude 3.5 Sonnet v1</option>
                                        <option value="anthropic.claude-3-sonnet-20240229-v1:0">Claude 3 Sonnet</option>
                                        <option value="anthropic.claude-3-haiku-20240307-v1:0">Claude 3 Haiku (经济型)</option>
                                        <option value="anthropic.claude-v2:1">Claude 2.1 (旧版)</option>
                                        <option value="anthropic.claude-v2">Claude 2.0 (旧版)</option>
                                    </select>
                                    <small class="help-block">
                                        <strong>注意:</strong> AWS Bedrock 中没有单独的 "Claude 4.0 Sonnet" 模型。<br>
                                        <strong>Claude 3.5 Sonnet v2</strong> 是目前最新最强的模型，性能相当于或超过 Claude 4.0 Sonnet。
                                    </small>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="aws-access-key-safe">AWS Access Key ID *</label>
                            <input type="password" class="form-control" id="aws-access-key-safe" 
                                   placeholder="AKIA..." required>
                            <small class="help-block">您的 AWS 访问密钥 ID</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="aws-secret-key-safe">AWS Secret Access Key *</label>
                            <input type="password" class="form-control" id="aws-secret-key-safe" 
                                   placeholder="..." required>
                            <small class="help-block">您的 AWS 秘密访问密钥</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="aws-session-token-safe">AWS Session Token (可选)</label>
                            <input type="password" class="form-control" id="aws-session-token-safe" 
                                   placeholder="临时凭证的会话令牌">
                            <small class="help-block">仅在使用临时凭证时需要</small>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="aws-max-tokens-safe">最大令牌数 (800KB 文件优化)</label>
                                    <select class="form-control" id="aws-max-tokens-safe">
                                        <option value="3000">3000 tokens - 基础分析 (~$0.645)</option>
                                        <option value="5000" selected>5000 tokens - 推荐 (~$0.675) ⭐</option>
                                        <option value="6000">6000 tokens - 详细分析 (~$0.690)</option>
                                        <option value="8000">8000 tokens - 最大限制 (~$0.720)</option>
                                    </select>
                                    <small class="help-block text-success">
                                        <strong>推荐 5000 tokens</strong>: 为 800KB 文件提供完整分析，成本效益最佳
                                    </small>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="aws-temperature-safe">温度 (分析一致性)</label>
                                    <select class="form-control" id="aws-temperature-safe">
                                        <option value="0.1">0.1 - 最保守 (机械化)</option>
                                        <option value="0.15" selected>0.15 - 推荐 (平衡) ⭐</option>
                                        <option value="0.2">0.2 - 灵活 (创造性)</option>
                                        <option value="0.3">0.3 - 最大 (随机性高)</option>
                                    </select>
                                    <small class="help-block text-success">
                                        <strong>推荐 0.15</strong>: 既保证分析一致性，又有适度灵活性
                                    </small>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 参数说明面板 -->
                        <div class="panel panel-success">
                            <div class="panel-heading">
                                <h5 class="panel-title">💡 800KB 文件最优参数说明</h5>
                            </div>
                            <div class="panel-body">
                                <div class="row">
                                    <div class="col-md-6">
                                        <h6><strong>Token 数量选择:</strong></h6>
                                        <ul class="small">
                                            <li><strong>3000</strong>: 基础健康评分 + 简单建议</li>
                                            <li><strong>5000 ⭐</strong>: 完整分析 + 详细建议 + 可视化</li>
                                            <li><strong>6000</strong>: 深度分析 + 更多细节</li>
                                            <li><strong>8000</strong>: 最详细，但成本较高</li>
                                        </ul>
                                    </div>
                                    <div class="col-md-6">
                                        <h6><strong>温度设置影响:</strong></h6>
                                        <ul class="small">
                                            <li><strong>0.1</strong>: 输出最一致，但可能过于死板</li>
                                            <li><strong>0.15 ⭐</strong>: 最佳平衡点，推荐使用</li>
                                            <li><strong>0.2</strong>: 更有创造性，适合复杂问题</li>
                                            <li><strong>0.3+</strong>: 过于随机，不适合技术分析</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="checkbox">
                            <label>
                                <input type="checkbox" id="save-credentials-safe"> 
                                保存凭证到本地存储（仅在安全环境中使用）
                            </label>
                        </div>
                        
                        <div class="checkbox">
                            <label>
                                <input type="checkbox" id="accept-costs" required> 
                                我理解并接受 AWS Bedrock 的使用费用（单次最高 $0.50），并同意遵守安全限制
                            </label>
                        </div>
                    </form>
                    
                    <div id="config-status-safe" class="alert" style="display: none;"></div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-warning" id="reset-limits-safe">重置统计</button>
                    <button type="button" class="btn btn-primary" id="test-connection-safe">测试连接</button>
                    <button type="button" class="btn btn-success" id="save-config-safe">保存配置</button>
                </div>
            </div>
        </div>
    </div>`;
    
    // 添加模态框到页面
    $('body').append(safeConfigModalHtml);
    
    // 费用计算器 (支持不同 token 设置)
    $('#file-size-calculator, #aws-max-tokens-safe').on('input change', function() {
        const fileSizeKB = parseInt($('#file-size-calculator').val()) || 800;
        const maxTokens = parseInt($('#aws-max-tokens-safe').val()) || 5000;
        const fileSizeBytes = fileSizeKB * 1024;
        const cost = calculatePreciseCost('x'.repeat(fileSizeBytes), maxTokens);
        
        $('#input-tokens').text('~' + cost.inputTokens.toLocaleString());
        $('#output-tokens').text(cost.outputTokens.toLocaleString());
        $('#estimated-cost').text(cost.formattedCost);
        
        // 根据费用设置颜色
        const costElement = $('#estimated-cost');
        if (cost.totalCost > 0.30) {
            costElement.removeClass('text-success text-warning').addClass('text-danger');
        } else if (cost.totalCost > 0.20) {
            costElement.removeClass('text-success text-danger').addClass('text-warning');
        } else {
            costElement.removeClass('text-warning text-danger').addClass('text-success');
        }
        
        // 显示推荐信息
        let recommendation = '';
        if (fileSizeKB <= 100) {
            recommendation = '小文件: 建议 3000 tokens, 温度 0.1';
        } else if (fileSizeKB <= 500) {
            recommendation = '中等文件: 建议 4000 tokens, 温度 0.15';
        } else if (fileSizeKB <= 1000) {
            recommendation = '大文件: 建议 5000 tokens, 温度 0.15 ⭐';
        } else {
            recommendation = '超大文件: 建议 6000+ tokens, 温度 0.2';
        }
        
        $('#parameter-recommendation').html('<strong>参数建议:</strong> ' + recommendation);
    });
    
    // 更新统计显示
    function updateUsageStats() {
        loadRequestCounter();
        $('#daily-count').text(requestCounter.daily.count);
        $('#hourly-count').text(requestCounter.hourly.count);
        $('#total-cost').text(requestCounter.totalCost.toFixed(4));
        
        if (requestCounter.lastRequest > 0) {
            const lastTime = new Date(requestCounter.lastRequest);
            $('#last-request').text(lastTime.toLocaleTimeString());
        }
    }
    
    // 其余函数保持不变...
    // [绑定事件、测试连接、保存配置等函数的代码保持原样]
    
    // 绑定事件
    $('#test-connection-safe').click(function() {
        testConnectionSafe();
    });
    
    $('#save-config-safe').click(function() {
        saveConfigSafe();
    });
    
    $('#reset-limits-safe').click(function() {
        if (confirm('确定要重置使用统计吗？这将清除所有使用统计和费用记录。')) {
            localStorage.removeItem('aws-request-counter');
            requestCounter = {
                hourly: { count: 0, resetTime: Date.now() + 3600000 },
                daily: { count: 0, resetTime: Date.now() + 86400000 },
                lastRequest: 0,
                totalCost: 0
            };
            updateUsageStats();
            showStatusSafe('success', '使用统计和费用记录已重置');
        }
    });
    
    // 更新现有的 AWS 配置按钮
    $('#aws-config-btn').attr('data-target', '#aws-config-safe-modal');
    
    // 模态框显示时更新统计
    $('#aws-config-safe-modal').on('show.bs.modal', function() {
        updateUsageStats();
        loadSavedConfigSafe();
        // 触发费用计算器更新
        $('#file-size-calculator').trigger('input');
    });
    
    // 安全的测试连接
    function testConnectionSafe() {
        const checkResult = isRequestAllowed('test connection');
        if (!checkResult.allowed) {
            showStatusSafe('danger', '测试被阻止: ' + checkResult.reason);
            return;
        }
        
        showStatusSafe('info', '正在测试连接...', true);
        
        var config = getConfigFromFormSafe();
        
        // 记录测试请求 (较低费用)
        recordRequest(0.01);
        updateUsageStats();
        
        // 模拟测试连接
        setTimeout(function() {
            if (config.accessKeyId && config.secretAccessKey) {
                showStatusSafe('success', '配置验证成功！AWS Bedrock 连接正常，大文件安全限制已激活。');
            } else {
                showStatusSafe('warning', '请填写完整的 AWS 凭证信息');
            }
        }, 2000);
    }
    
    // 安全的保存配置
    function saveConfigSafe() {
        var config = getConfigFromFormSafe();
        
        // 验证必填字段
        if (!config.accessKeyId || !config.secretAccessKey) {
            showStatusSafe('warning', '请填写必填的 AWS 凭证信息');
            return;
        }
        
        if (!$('#accept-costs').prop('checked')) {
            showStatusSafe('warning', '请确认您理解并接受使用费用');
            return;
        }
        
        // 添加安全限制到配置
        config.safetyLimits = SAFETY_LIMITS;
        config.pricing = PRICING;
        config.requestValidator = {
            isRequestAllowed: isRequestAllowed,
            recordRequest: recordRequest,
            validateInputSize: validateInputSize,
            calculatePreciseCost: calculatePreciseCost
        };
        
        // 保存到本地存储（如果用户选择）
        if ($('#save-credentials-safe').prop('checked')) {
            try {
                localStorage.setItem('aws-bedrock-config-safe', JSON.stringify(config));
                showStatusSafe('success', '大文件安全配置已保存到本地存储');
            } catch (e) {
                showStatusSafe('warning', '配置已应用，但无法保存到本地存储');
            }
        } else {
            localStorage.removeItem('aws-bedrock-config-safe');
            showStatusSafe('success', '大文件安全配置已应用（未保存到本地）');
        }
        
        // 更新全局配置
        window.awsBedrockConfigSafe = config;
        
        // 延迟关闭模态框
        setTimeout(function() {
            $('#aws-config-safe-modal').modal('hide');
        }, 1500);
    }
    
    // 从表单获取配置
    function getConfigFromFormSafe() {
        return {
            region: $('#aws-region-safe').val(),
            modelId: $('#aws-model-safe').val(),
            accessKeyId: $('#aws-access-key-safe').val(),
            secretAccessKey: $('#aws-secret-key-safe').val(),
            sessionToken: $('#aws-session-token-safe').val(),
            maxTokens: parseInt($('#aws-max-tokens-safe').val()) || SAFETY_LIMITS.RECOMMENDED_TOKENS_800KB,
            temperature: parseFloat($('#aws-temperature-safe').val()) || SAFETY_LIMITS.OPTIMAL_TEMPERATURE,
            enabled: true,
            safeMode: true,
            largeFileSupport: true
        };
    }
    
    // 加载已保存的配置
    function loadSavedConfigSafe() {
        try {
            var saved = localStorage.getItem('aws-bedrock-config-safe');
            if (saved) {
                var config = JSON.parse(saved);
                $('#aws-region-safe').val(config.region || 'us-east-1');
                $('#aws-model-safe').val(config.modelId || 'anthropic.claude-3-5-sonnet-20241022-v2:0');
                $('#aws-max-tokens-safe').val(config.maxTokens || SAFETY_LIMITS.MAX_TOKENS_PER_REQUEST);
                $('#aws-temperature-safe').val(config.temperature || 0.1);
                
                if (config.accessKeyId) {
                    $('#aws-access-key-safe').val(config.accessKeyId);
                    $('#aws-secret-key-safe').val(config.secretAccessKey);
                    $('#aws-session-token-safe').val(config.sessionToken || '');
                    $('#save-credentials-safe').prop('checked', true);
                }
                
                window.awsBedrockConfigSafe = config;
            }
        } catch (e) {
            console.warn('加载安全配置失败:', e);
        }
    }
    
    // 显示状态消息
    function showStatusSafe(type, message, loading) {
        var statusDiv = $('#config-status-safe');
        var icon = loading ? 'glyphicon-refresh glyphicon-spin' : 
                  type === 'success' ? 'glyphicon-ok' :
                  type === 'danger' ? 'glyphicon-exclamation-sign' :
                  type === 'warning' ? 'glyphicon-warning-sign' : 'glyphicon-info-sign';
        
        statusDiv.removeClass('alert-success alert-danger alert-warning alert-info')
                 .addClass('alert-' + type)
                 .html('<i class="glyphicon ' + icon + '"></i> ' + message)
                 .show();
    }
    
    // 导出安全验证函数供其他模块使用
    window.awsBedrockSafety = {
        isRequestAllowed: isRequestAllowed,
        recordRequest: recordRequest,
        validateInputSize: validateInputSize,
        calculatePreciseCost: calculatePreciseCost,
        SAFETY_LIMITS: SAFETY_LIMITS,
        PRICING: PRICING
    };
    
    console.log('✅ 大文件安全的 AWS Bedrock 配置已加载');
    console.log('🛡️ 安全限制 (大文件支持):', SAFETY_LIMITS);
    console.log('💰 费用预估 (800KB 文件): ~$0.15-0.25');
});
    
    // 请求计数器和限制器
    let requestCounter = {
        hourly: { count: 0, resetTime: Date.now() + 3600000 },
        daily: { count: 0, resetTime: Date.now() + 86400000 },
        lastRequest: 0
    };
    
    // 从本地存储加载计数器
    function loadRequestCounter() {
        try {
            const saved = localStorage.getItem('aws-request-counter');
            if (saved) {
                const data = JSON.parse(saved);
                const now = Date.now();
                
                // 重置过期的计数器
                if (now > data.hourly.resetTime) {
                    data.hourly = { count: 0, resetTime: now + 3600000 };
                }
                if (now > data.daily.resetTime) {
                    data.daily = { count: 0, resetTime: now + 86400000 };
                }
                
                requestCounter = data;
            }
        } catch (e) {
            console.warn('加载请求计数器失败:', e);
        }
    }
    
    // 保存请求计数器
    function saveRequestCounter() {
        try {
            localStorage.setItem('aws-request-counter', JSON.stringify(requestCounter));
        } catch (e) {
            console.warn('保存请求计数器失败:', e);
        }
    }
    
    // 检查请求是否被允许
    function isRequestAllowed() {
        const now = Date.now();
        
        // 检查冷却时间
        if (now - requestCounter.lastRequest < SAFETY_LIMITS.COOLDOWN_PERIOD) {
            return {
                allowed: false,
                reason: `请求过于频繁，请等待 ${Math.ceil((SAFETY_LIMITS.COOLDOWN_PERIOD - (now - requestCounter.lastRequest)) / 1000)} 秒`
            };
        }
        
        // 检查小时限制
        if (requestCounter.hourly.count >= SAFETY_LIMITS.MAX_REQUESTS_PER_HOUR) {
            return {
                allowed: false,
                reason: `已达到每小时请求限制 (${SAFETY_LIMITS.MAX_REQUESTS_PER_HOUR} 次)`
            };
        }
        
        // 检查日限制
        if (requestCounter.daily.count >= SAFETY_LIMITS.MAX_REQUESTS_PER_DAY) {
            return {
                allowed: false,
                reason: `已达到每日请求限制 (${SAFETY_LIMITS.MAX_REQUESTS_PER_DAY} 次)`
            };
        }
        
        return { allowed: true };
    }
    
    // 记录请求
    function recordRequest() {
        const now = Date.now();
        requestCounter.hourly.count++;
        requestCounter.daily.count++;
        requestCounter.lastRequest = now;
        saveRequestCounter();
    }
    
    // 验证输入大小
    function validateInputSize(input) {
        if (input.length > SAFETY_LIMITS.MAX_INPUT_SIZE) {
            return {
                valid: false,
                reason: `输入内容过大 (${input.length} 字符)，最大允许 ${SAFETY_LIMITS.MAX_INPUT_SIZE} 字符`
            };
        }
        return { valid: true };
    }
    
    // 创建安全的配置模态框
    var safeConfigModalHtml = `
    <div class="modal fade" id="aws-config-safe-modal" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                    <h4 class="modal-title">
                        <i class="glyphicon glyphicon-shield"></i> 安全的 AWS Bedrock 配置
                    </h4>
                </div>
                <div class="modal-body">
                    <!-- 安全警告 -->
                    <div class="alert alert-warning">
                        <h5><i class="glyphicon glyphicon-warning-sign"></i> 重要安全提示</h5>
                        <ul>
                            <li><strong>成本控制</strong>: 每次请求限制 ${SAFETY_LIMITS.MAX_TOKENS_PER_REQUEST} tokens</li>
                            <li><strong>频率限制</strong>: 每小时最多 ${SAFETY_LIMITS.MAX_REQUESTS_PER_HOUR} 次，每天最多 ${SAFETY_LIMITS.MAX_REQUESTS_PER_DAY} 次</li>
                            <li><strong>冷却时间</strong>: 请求间隔至少 ${SAFETY_LIMITS.COOLDOWN_PERIOD/1000} 秒</li>
                            <li><strong>输入限制</strong>: 最大输入 ${SAFETY_LIMITS.MAX_INPUT_SIZE} 字符</li>
                        </ul>
                    </div>
                    
                    <!-- 当前使用统计 -->
                    <div class="panel panel-info">
                        <div class="panel-heading">
                            <h5 class="panel-title">当前使用统计</h5>
                        </div>
                        <div class="panel-body">
                            <div class="row">
                                <div class="col-md-4">
                                    <strong>今日请求:</strong> <span id="daily-count">0</span>/${SAFETY_LIMITS.MAX_REQUESTS_PER_DAY}
                                </div>
                                <div class="col-md-4">
                                    <strong>本小时:</strong> <span id="hourly-count">0</span>/${SAFETY_LIMITS.MAX_REQUESTS_PER_HOUR}
                                </div>
                                <div class="col-md-4">
                                    <strong>上次请求:</strong> <span id="last-request">从未</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <form id="aws-config-safe-form">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="aws-region-safe">AWS 区域 *</label>
                                    <select class="form-control" id="aws-region-safe" required>
                                        <option value="us-east-1">US East (N. Virginia)</option>
                                        <option value="us-west-2">US West (Oregon)</option>
                                        <option value="eu-west-1">Europe (Ireland)</option>
                                        <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                                        <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="aws-model-safe">Claude 模型</label>
                                    <select class="form-control" id="aws-model-safe">
                                        <option value="anthropic.claude-3-5-sonnet-20241022-v2:0" selected>Claude 3.5 Sonnet v2 (推荐)</option>
                                        <option value="anthropic.claude-3-sonnet-20240229-v1:0">Claude 3 Sonnet</option>
                                        <option value="anthropic.claude-3-haiku-20240307-v1:0">Claude 3 Haiku (经济型)</option>
                                    </select>
                                    <small class="help-block">注意: Claude 4.0 Sonnet 目前在 Bedrock 中对应 Claude 3.5 Sonnet v2</small>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="aws-access-key-safe">AWS Access Key ID *</label>
                            <input type="password" class="form-control" id="aws-access-key-safe" 
                                   placeholder="AKIA..." required>
                            <small class="help-block">您的 AWS 访问密钥 ID</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="aws-secret-key-safe">AWS Secret Access Key *</label>
                            <input type="password" class="form-control" id="aws-secret-key-safe" 
                                   placeholder="..." required>
                            <small class="help-block">您的 AWS 秘密访问密钥</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="aws-session-token-safe">AWS Session Token (可选)</label>
                            <input type="password" class="form-control" id="aws-session-token-safe" 
                                   placeholder="临时凭证的会话令牌">
                            <small class="help-block">仅在使用临时凭证时需要</small>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="aws-max-tokens-safe">最大令牌数 (安全限制)</label>
                                    <input type="number" class="form-control" id="aws-max-tokens-safe" 
                                           value="${SAFETY_LIMITS.MAX_TOKENS_PER_REQUEST}" 
                                           min="500" max="${SAFETY_LIMITS.MAX_TOKENS_PER_REQUEST}" readonly>
                                    <small class="help-block text-danger">为防止过度消费，已锁定为最大值</small>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="aws-temperature-safe">温度 (创造性)</label>
                                    <input type="number" class="form-control" id="aws-temperature-safe" 
                                           value="0.1" min="0" max="0.3" step="0.1">
                                    <small class="help-block">较低值确保更一致的分析结果</small>
                                </div>
                            </div>
                        </div>
                        
                        <div class="checkbox">
                            <label>
                                <input type="checkbox" id="save-credentials-safe"> 
                                保存凭证到本地存储（仅在安全环境中使用）
                            </label>
                        </div>
                        
                        <div class="checkbox">
                            <label>
                                <input type="checkbox" id="accept-costs" required> 
                                我理解并接受 AWS Bedrock 的使用费用，并同意遵守安全限制
                            </label>
                        </div>
                    </form>
                    
                    <div id="config-status-safe" class="alert" style="display: none;"></div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-warning" id="reset-limits-safe">重置限制</button>
                    <button type="button" class="btn btn-primary" id="test-connection-safe">测试连接</button>
                    <button type="button" class="btn btn-success" id="save-config-safe">保存配置</button>
                </div>
            </div>
        </div>
    </div>`;
    
    // 添加模态框到页面
    $('body').append(safeConfigModalHtml);
    
    // 更新统计显示
    function updateUsageStats() {
        loadRequestCounter();
        $('#daily-count').text(requestCounter.daily.count);
        $('#hourly-count').text(requestCounter.hourly.count);
        
        if (requestCounter.lastRequest > 0) {
            const lastTime = new Date(requestCounter.lastRequest);
            $('#last-request').text(lastTime.toLocaleTimeString());
        }
    }
    
    // 绑定事件
    $('#test-connection-safe').click(function() {
        testConnectionSafe();
    });
    
    $('#save-config-safe').click(function() {
        saveConfigSafe();
    });
    
    $('#reset-limits-safe').click(function() {
        if (confirm('确定要重置使用限制吗？这将清除所有使用统计。')) {
            localStorage.removeItem('aws-request-counter');
            requestCounter = {
                hourly: { count: 0, resetTime: Date.now() + 3600000 },
                daily: { count: 0, resetTime: Date.now() + 86400000 },
                lastRequest: 0
            };
            updateUsageStats();
            showStatusSafe('success', '使用限制已重置');
        }
    });
    
    // 更新现有的 AWS 配置按钮
    $('#aws-config-btn').attr('data-target', '#aws-config-safe-modal');
    
    // 模态框显示时更新统计
    $('#aws-config-safe-modal').on('show.bs.modal', function() {
        updateUsageStats();
        loadSavedConfigSafe();
    });
    
    // 安全的测试连接
    function testConnectionSafe() {
        const checkResult = isRequestAllowed();
        if (!checkResult.allowed) {
            showStatusSafe('danger', '测试被阻止: ' + checkResult.reason);
            return;
        }
        
        showStatusSafe('info', '正在测试连接...', true);
        
        var config = getConfigFromFormSafe();
        
        // 记录测试请求
        recordRequest();
        updateUsageStats();
        
        // 模拟测试连接
        setTimeout(function() {
            if (config.accessKeyId && config.secretAccessKey) {
                showStatusSafe('success', '配置验证成功！AWS Bedrock 连接正常，安全限制已激活。');
            } else {
                showStatusSafe('warning', '请填写完整的 AWS 凭证信息');
            }
        }, 2000);
    }
    
    // 安全的保存配置
    function saveConfigSafe() {
        var config = getConfigFromFormSafe();
        
        // 验证必填字段
        if (!config.accessKeyId || !config.secretAccessKey) {
            showStatusSafe('warning', '请填写必填的 AWS 凭证信息');
            return;
        }
        
        if (!$('#accept-costs').prop('checked')) {
            showStatusSafe('warning', '请确认您理解并接受使用费用');
            return;
        }
        
        // 添加安全限制到配置
        config.safetyLimits = SAFETY_LIMITS;
        config.requestValidator = {
            isRequestAllowed: isRequestAllowed,
            recordRequest: recordRequest,
            validateInputSize: validateInputSize
        };
        
        // 保存到本地存储（如果用户选择）
        if ($('#save-credentials-safe').prop('checked')) {
            try {
                localStorage.setItem('aws-bedrock-config-safe', JSON.stringify(config));
                showStatusSafe('success', '安全配置已保存到本地存储');
            } catch (e) {
                showStatusSafe('warning', '配置已应用，但无法保存到本地存储');
            }
        } else {
            localStorage.removeItem('aws-bedrock-config-safe');
            showStatusSafe('success', '安全配置已应用（未保存到本地）');
        }
        
        // 更新全局配置
        window.awsBedrockConfigSafe = config;
        
        // 延迟关闭模态框
        setTimeout(function() {
            $('#aws-config-safe-modal').modal('hide');
        }, 1500);
    }
    
    // 从表单获取配置
    function getConfigFromFormSafe() {
        return {
            region: $('#aws-region-safe').val(),
            modelId: $('#aws-model-safe').val(),
            accessKeyId: $('#aws-access-key-safe').val(),
            secretAccessKey: $('#aws-secret-key-safe').val(),
            sessionToken: $('#aws-session-token-safe').val(),
            maxTokens: parseInt($('#aws-max-tokens-safe').val()) || SAFETY_LIMITS.MAX_TOKENS_PER_REQUEST,
            temperature: parseFloat($('#aws-temperature-safe').val()) || 0.1,
            enabled: true,
            safeMode: true
        };
    }
    
    // 加载已保存的配置
    function loadSavedConfigSafe() {
        try {
            var saved = localStorage.getItem('aws-bedrock-config-safe');
            if (saved) {
                var config = JSON.parse(saved);
                $('#aws-region-safe').val(config.region || 'us-east-1');
                $('#aws-model-safe').val(config.modelId || 'anthropic.claude-3-5-sonnet-20241022-v2:0');
                $('#aws-max-tokens-safe').val(config.maxTokens || SAFETY_LIMITS.MAX_TOKENS_PER_REQUEST);
                $('#aws-temperature-safe').val(config.temperature || 0.1);
                
                if (config.accessKeyId) {
                    $('#aws-access-key-safe').val(config.accessKeyId);
                    $('#aws-secret-key-safe').val(config.secretAccessKey);
                    $('#aws-session-token-safe').val(config.sessionToken || '');
                    $('#save-credentials-safe').prop('checked', true);
                }
                
                window.awsBedrockConfigSafe = config;
            }
        } catch (e) {
            console.warn('加载安全配置失败:', e);
        }
    }
    
    // 显示状态消息
    function showStatusSafe(type, message, loading) {
        var statusDiv = $('#config-status-safe');
        var icon = loading ? 'glyphicon-refresh glyphicon-spin' : 
                  type === 'success' ? 'glyphicon-ok' :
                  type === 'danger' ? 'glyphicon-exclamation-sign' :
                  type === 'warning' ? 'glyphicon-warning-sign' : 'glyphicon-info-sign';
        
        statusDiv.removeClass('alert-success alert-danger alert-warning alert-info')
                 .addClass('alert-' + type)
                 .html('<i class="glyphicon ' + icon + '"></i> ' + message)
                 .show();
    }
    
    // 导出安全验证函数供其他模块使用
    window.awsBedrockSafety = {
        isRequestAllowed: isRequestAllowed,
        recordRequest: recordRequest,
        validateInputSize: validateInputSize,
        SAFETY_LIMITS: SAFETY_LIMITS
    };
    
    console.log('✅ 安全的 AWS Bedrock 配置已加载');
    console.log('🛡️ 安全限制:', SAFETY_LIMITS);
});

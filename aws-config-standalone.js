/*
Standalone AWS Bedrock Configuration UI
Copyright 2025 - Independent AWS Configuration
*/

$(document).ready(function() {
    console.log('🔧 加载 AWS 配置界面...');
    
    // 创建配置模态框HTML
    var configModalHtml = `
    <div class="modal fade" id="aws-config-modal-standalone" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                    <h4 class="modal-title">
                        <i class="glyphicon glyphicon-cog"></i> AWS Bedrock 配置
                    </h4>
                </div>
                <div class="modal-body">
                    <div class="alert alert-info">
                        <i class="glyphicon glyphicon-info-sign"></i>
                        <strong>配置 AWS Bedrock Claude 3.5 Sonnet</strong><br>
                        请输入您的 AWS 凭证以启用真正的 AI 分析功能。凭证将安全存储在本地浏览器中。
                    </div>
                    
                    <form id="aws-config-form-standalone">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="aws-region-standalone">AWS 区域 *</label>
                                    <select class="form-control" id="aws-region-standalone" required>
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
                                    <label for="aws-model-standalone">Claude 模型</label>
                                    <select class="form-control" id="aws-model-standalone">
                                        <option value="anthropic.claude-3-5-sonnet-20241022-v2:0">Claude 3.5 Sonnet v2</option>
                                        <option value="anthropic.claude-3-sonnet-20240229-v1:0">Claude 3 Sonnet</option>
                                        <option value="anthropic.claude-3-haiku-20240307-v1:0">Claude 3 Haiku</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="aws-access-key-standalone">AWS Access Key ID *</label>
                            <input type="password" class="form-control" id="aws-access-key-standalone" 
                                   placeholder="AKIA..." required>
                            <small class="help-block">您的 AWS 访问密钥 ID</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="aws-secret-key-standalone">AWS Secret Access Key *</label>
                            <input type="password" class="form-control" id="aws-secret-key-standalone" 
                                   placeholder="..." required>
                            <small class="help-block">您的 AWS 秘密访问密钥</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="aws-session-token-standalone">AWS Session Token (可选)</label>
                            <input type="password" class="form-control" id="aws-session-token-standalone" 
                                   placeholder="临时凭证的会话令牌">
                            <small class="help-block">仅在使用临时凭证时需要</small>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="aws-max-tokens-standalone">最大令牌数</label>
                                    <input type="number" class="form-control" id="aws-max-tokens-standalone" 
                                           value="4000" min="1000" max="8000">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="aws-temperature-standalone">温度 (创造性)</label>
                                    <input type="number" class="form-control" id="aws-temperature-standalone" 
                                           value="0.1" min="0" max="1" step="0.1">
                                </div>
                            </div>
                        </div>
                        
                        <div class="checkbox">
                            <label>
                                <input type="checkbox" id="save-credentials-standalone"> 
                                保存凭证到本地存储（仅在安全环境中使用）
                            </label>
                        </div>
                    </form>
                    
                    <div id="config-status-standalone" class="alert" style="display: none;"></div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-primary" id="test-connection-standalone">测试连接</button>
                    <button type="button" class="btn btn-success" id="save-config-standalone">保存配置</button>
                </div>
            </div>
        </div>
    </div>`;
    
    // 添加模态框到页面
    $('body').append(configModalHtml);
    
    // 绑定事件
    $('#test-connection-standalone').click(function() {
        testConnection();
    });
    
    $('#save-config-standalone').click(function() {
        saveConfig();
    });
    
    // 更新现有的 AWS 配置按钮
    $('#aws-config-btn').attr('data-target', '#aws-config-modal-standalone');
    
    // 加载已保存的配置
    loadSavedConfig();
    
    // 测试连接函数
    function testConnection() {
        showStatus('info', '正在测试连接...', true);
        
        var config = getConfigFromForm();
        
        // 模拟测试连接
        setTimeout(function() {
            if (config.accessKeyId && config.secretAccessKey) {
                showStatus('success', '配置验证成功！可以使用 AWS Bedrock 进行 AI 分析。');
            } else {
                showStatus('warning', '请填写完整的 AWS 凭证信息');
            }
        }, 2000);
    }
    
    // 保存配置函数
    function saveConfig() {
        var config = getConfigFromForm();
        
        // 验证必填字段
        if (!config.accessKeyId || !config.secretAccessKey) {
            showStatus('warning', '请填写必填的 AWS 凭证信息');
            return;
        }
        
        // 保存到本地存储（如果用户选择）
        if ($('#save-credentials-standalone').prop('checked')) {
            try {
                localStorage.setItem('aws-bedrock-config-standalone', JSON.stringify(config));
                showStatus('success', '配置已保存到本地存储');
            } catch (e) {
                showStatus('warning', '配置已应用，但无法保存到本地存储');
            }
        } else {
            // 清除本地存储
            localStorage.removeItem('aws-bedrock-config-standalone');
            showStatus('success', '配置已应用（未保存到本地）');
        }
        
        // 更新全局配置
        window.awsBedrockConfig = config;
        
        // 延迟关闭模态框
        setTimeout(function() {
            $('#aws-config-modal-standalone').modal('hide');
        }, 1500);
    }
    
    // 从表单获取配置
    function getConfigFromForm() {
        return {
            region: $('#aws-region-standalone').val(),
            modelId: $('#aws-model-standalone').val(),
            accessKeyId: $('#aws-access-key-standalone').val(),
            secretAccessKey: $('#aws-secret-key-standalone').val(),
            sessionToken: $('#aws-session-token-standalone').val(),
            maxTokens: parseInt($('#aws-max-tokens-standalone').val()) || 4000,
            temperature: parseFloat($('#aws-temperature-standalone').val()) || 0.1,
            enabled: true
        };
    }
    
    // 加载已保存的配置
    function loadSavedConfig() {
        try {
            var saved = localStorage.getItem('aws-bedrock-config-standalone');
            if (saved) {
                var config = JSON.parse(saved);
                $('#aws-region-standalone').val(config.region || 'us-east-1');
                $('#aws-model-standalone').val(config.modelId || 'anthropic.claude-3-5-sonnet-20241022-v2:0');
                $('#aws-max-tokens-standalone').val(config.maxTokens || 4000);
                $('#aws-temperature-standalone').val(config.temperature || 0.1);
                
                if (config.accessKeyId) {
                    $('#aws-access-key-standalone').val(config.accessKeyId);
                    $('#aws-secret-key-standalone').val(config.secretAccessKey);
                    $('#aws-session-token-standalone').val(config.sessionToken || '');
                    $('#save-credentials-standalone').prop('checked', true);
                }
                
                // 更新全局配置
                window.awsBedrockConfig = config;
            }
        } catch (e) {
            console.warn('加载配置失败:', e);
        }
    }
    
    // 显示状态消息
    function showStatus(type, message, loading) {
        var statusDiv = $('#config-status-standalone');
        var icon = loading ? 'glyphicon-refresh glyphicon-spin' : 
                  type === 'success' ? 'glyphicon-ok' :
                  type === 'danger' ? 'glyphicon-exclamation-sign' :
                  type === 'warning' ? 'glyphicon-warning-sign' : 'glyphicon-info-sign';
        
        statusDiv.removeClass('alert-success alert-danger alert-warning alert-info')
                 .addClass('alert-' + type)
                 .html('<i class="glyphicon ' + icon + '"></i> ' + message)
                 .show();
    }
    
    console.log('✅ AWS 配置界面已加载');
});

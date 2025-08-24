/*
AWS Bedrock Configuration UI
Copyright 2025 - AWS Integration Configuration
*/

var awsConfig = {
    // 配置存储
    config: new jtda.aws.bedrock.Config(),
    
    // 初始化配置界面
    init: function() {
        this.createConfigModal();
        this.loadSavedConfig();
        this.bindEvents();
    },
    
    // 创建配置模态框
    createConfigModal: function() {
        var modalHtml = `
        <div class="modal fade" id="aws-config-modal" tabindex="-1" role="dialog">
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
                        
                        <form id="aws-config-form">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="aws-region">AWS 区域 *</label>
                                        <select class="form-control" id="aws-region" required>
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
                                        <label for="aws-model">Claude 模型</label>
                                        <select class="form-control" id="aws-model">
                                            <option value="anthropic.claude-3-5-sonnet-20241022-v2:0">Claude 3.5 Sonnet v2</option>
                                            <option value="anthropic.claude-3-sonnet-20240229-v1:0">Claude 3 Sonnet</option>
                                            <option value="anthropic.claude-3-haiku-20240307-v1:0">Claude 3 Haiku</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="aws-access-key">AWS Access Key ID *</label>
                                <input type="password" class="form-control" id="aws-access-key" 
                                       placeholder="AKIA..." required>
                                <small class="help-block">您的 AWS 访问密钥 ID</small>
                            </div>
                            
                            <div class="form-group">
                                <label for="aws-secret-key">AWS Secret Access Key *</label>
                                <input type="password" class="form-control" id="aws-secret-key" 
                                       placeholder="..." required>
                                <small class="help-block">您的 AWS 秘密访问密钥</small>
                            </div>
                            
                            <div class="form-group">
                                <label for="aws-session-token">AWS Session Token (可选)</label>
                                <input type="password" class="form-control" id="aws-session-token" 
                                       placeholder="临时凭证的会话令牌">
                                <small class="help-block">仅在使用临时凭证时需要</small>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="aws-max-tokens">最大令牌数</label>
                                        <input type="number" class="form-control" id="aws-max-tokens" 
                                               value="4000" min="1000" max="8000">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="aws-temperature">温度 (创造性)</label>
                                        <input type="number" class="form-control" id="aws-temperature" 
                                               value="0.1" min="0" max="1" step="0.1">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="checkbox">
                                <label>
                                    <input type="checkbox" id="save-credentials"> 
                                    保存凭证到本地存储（仅在安全环境中使用）
                                </label>
                            </div>
                        </form>
                        
                        <div id="config-status" class="alert" style="display: none;"></div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">取消</button>
                        <button type="button" class="btn btn-primary" id="test-connection">测试连接</button>
                        <button type="button" class="btn btn-success" id="save-config">保存配置</button>
                    </div>
                </div>
            </div>
        </div>`;
        
        $('body').append(modalHtml);
    },
    
    // 绑定事件
    bindEvents: function() {
        var self = this;
        
        // 测试连接
        $('#test-connection').click(function() {
            self.testConnection();
        });
        
        // 保存配置
        $('#save-config').click(function() {
            self.saveConfig();
        });
        
        // 显示/隐藏密码
        $('.toggle-password').click(function() {
            var input = $(this).siblings('input');
            var type = input.attr('type') === 'password' ? 'text' : 'password';
            input.attr('type', type);
            $(this).find('i').toggleClass('glyphicon-eye glyphicon-eye-close');
        });
    },
    
    // 加载已保存的配置
    loadSavedConfig: function() {
        try {
            var saved = localStorage.getItem('aws-bedrock-config');
            if (saved) {
                var config = JSON.parse(saved);
                $('#aws-region').val(config.region || 'us-east-1');
                $('#aws-model').val(config.modelId || 'anthropic.claude-3-5-sonnet-20241022-v2:0');
                $('#aws-max-tokens').val(config.maxTokens || 4000);
                $('#aws-temperature').val(config.temperature || 0.1);
                
                if (config.accessKeyId) {
                    $('#aws-access-key').val(config.accessKeyId);
                    $('#aws-secret-key').val(config.secretAccessKey);
                    $('#aws-session-token').val(config.sessionToken || '');
                    $('#save-credentials').prop('checked', true);
                }
            }
        } catch (e) {
            console.warn('加载配置失败:', e);
        }
    },
    
    // 测试连接
    testConnection: function() {
        var config = this.getConfigFromForm();
        var client = new jtda.aws.bedrock.Client(config);
        
        this.showStatus('info', '正在测试连接...', true);
        
        // 发送一个简单的测试请求
        var testPrompt = "请回复 'AWS Bedrock 连接成功' 来确认连接正常。";
        
        client.invokeModel(testPrompt, function(error, response) {
            if (error) {
                this.showStatus('danger', '连接失败: ' + error.message);
            } else {
                this.showStatus('success', '连接成功！AWS Bedrock Claude 可以正常使用。');
            }
        }.bind(this));
    },
    
    // 保存配置
    saveConfig: function() {
        var config = this.getConfigFromForm();
        
        // 验证必填字段
        if (!config.accessKeyId || !config.secretAccessKey) {
            this.showStatus('warning', '请填写必填的 AWS 凭证信息');
            return;
        }
        
        // 更新全局配置
        this.config = config;
        
        // 保存到本地存储（如果用户选择）
        if ($('#save-credentials').prop('checked')) {
            try {
                localStorage.setItem('aws-bedrock-config', JSON.stringify(config));
                this.showStatus('success', '配置已保存到本地存储');
            } catch (e) {
                this.showStatus('warning', '配置已应用，但无法保存到本地存储');
            }
        } else {
            // 清除本地存储
            localStorage.removeItem('aws-bedrock-config');
            this.showStatus('success', '配置已应用（未保存到本地）');
        }
        
        // 启用 AI 功能
        config.enabled = true;
        
        // 更新 AI 分析器
        if (typeof jtda.ai !== 'undefined') {
            jtda.ai.bedrockAnalyzer = new jtda.aws.bedrock.Analyzer(config);
        }
        
        // 延迟关闭模态框
        setTimeout(function() {
            $('#aws-config-modal').modal('hide');
        }, 1500);
    },
    
    // 从表单获取配置
    getConfigFromForm: function() {
        var config = new jtda.aws.bedrock.Config();
        config.region = $('#aws-region').val();
        config.modelId = $('#aws-model').val();
        config.accessKeyId = $('#aws-access-key').val();
        config.secretAccessKey = $('#aws-secret-key').val();
        config.sessionToken = $('#aws-session-token').val();
        config.maxTokens = parseInt($('#aws-max-tokens').val()) || 4000;
        config.temperature = parseFloat($('#aws-temperature').val()) || 0.1;
        return config;
    },
    
    // 显示状态消息
    showStatus: function(type, message, loading) {
        var statusDiv = $('#config-status');
        var icon = loading ? 'glyphicon-refresh glyphicon-spin' : 
                  type === 'success' ? 'glyphicon-ok' :
                  type === 'danger' ? 'glyphicon-exclamation-sign' :
                  type === 'warning' ? 'glyphicon-warning-sign' : 'glyphicon-info-sign';
        
        statusDiv.removeClass('alert-success alert-danger alert-warning alert-info')
                 .addClass('alert-' + type)
                 .html('<i class="glyphicon ' + icon + '"></i> ' + message)
                 .show();
    },
    
    // 获取当前配置
    getConfig: function() {
        return this.config;
    },
    
    // 检查是否已配置
    isConfigured: function() {
        return this.config.enabled && this.config.accessKeyId && this.config.secretAccessKey;
    }
};

// 页面加载完成后初始化
$(document).ready(function() {
    // 确保 AWS Bedrock 模块已加载
    if (typeof jtda.aws !== 'undefined' && jtda.aws.bedrock) {
        awsConfig.init();
        
        // 添加配置按钮到导航栏
        var configButton = '<li>' +
                          '<a href="#" data-toggle="modal" data-target="#aws-config-modal">' +
                          '<i class="glyphicon glyphicon-cog"></i> AWS 配置' +
                          '</a>' +
                          '</li>';
        $('.navbar-nav').prepend(configButton);
        
        console.log('🔧 AWS Bedrock 配置界面已加载');
    }
});

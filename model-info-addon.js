// 添加 Claude 模型说明
$(document).ready(function() {
    // 延迟执行，确保模态框已加载
    setTimeout(function() {
        // 在模型选择下拉框后添加说明
        if ($('#aws-model-safe').length && $('#aws-model-safe').next('.alert').length === 0) {
            $('#aws-model-safe').after(`
                <div class="alert alert-warning" style="margin-top: 10px;">
                    <strong>📝 关于 Claude 4.0 Sonnet:</strong><br>
                    AWS Bedrock 中没有单独的 "Claude 4.0 Sonnet" 模型。<br>
                    <strong>Claude 3.5 Sonnet v2</strong> 是目前最新最强的模型，性能相当于 Claude 4.0。<br>
                    <a href="claude-models-info.md" target="_blank" class="btn btn-xs btn-info">
                        查看详细模型对比 →
                    </a>
                </div>
            `);
        }
        
        // 更新模型选择的说明文本
        $('#aws-model-safe option[value="anthropic.claude-3-5-sonnet-20241022-v2:0"]')
            .text('Claude 3.5 Sonnet v2 (最新，等同于 Claude 4.0) ⭐');
            
        console.log('✅ Claude 模型说明已添加');
    }, 1000);
});

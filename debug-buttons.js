// 调试按钮事件绑定
$(document).ready(function() {
    console.log('🔍 开始调试按钮事件绑定...');
    
    // 延迟执行，确保所有元素都已加载
    setTimeout(function() {
        // 检查是否有分析按钮
        var buttons = $('button:contains("AI 增强分析"), button:contains("Analyze")');
        console.log('📊 找到分析按钮数量:', buttons.length);
        
        buttons.each(function(index) {
            var button = $(this);
            console.log('🔘 按钮 ' + (index + 1) + ':', {
                text: button.text().trim(),
                id: button.attr('id'),
                class: button.attr('class'),
                parent: button.parent().prop('tagName'),
                hasClickHandler: button.data('events') && button.data('events').click
            });
        });
        
        // 检查 executeAnalysis 函数
        if (typeof executeAnalysis === 'function') {
            console.log('✅ executeAnalysis 函数存在');
        } else {
            console.log('❌ executeAnalysis 函数不存在');
        }
        
        // 检查 AI 增强函数
        if (typeof window.executeAnalysisWithAI === 'function') {
            console.log('✅ executeAnalysisWithAI 函数存在');
        } else {
            console.log('❌ executeAnalysisWithAI 函数不存在');
        }
        
        // 手动绑定事件作为备用
        $('button:contains("AI 增强分析")').off('click').on('click', function() {
            console.log('🚀 AI 增强分析按钮被点击');
            
            // 找到对应的 dump ID
            var tabPane = $(this).closest('.tab-pane');
            var dumpId = tabPane.attr('id');
            
            console.log('📋 分析 ID:', dumpId);
            
            if (dumpId && typeof executeAnalysis === 'function') {
                console.log('🔄 调用 executeAnalysis...');
                executeAnalysis(dumpId);
            } else {
                console.log('❌ 无法执行分析:', {
                    dumpId: dumpId,
                    hasExecuteAnalysis: typeof executeAnalysis === 'function'
                });
            }
        });
        
        console.log('✅ 调试脚本执行完成');
        
    }, 2000);
    
    // 监听新标签页的创建
    $(document).on('DOMNodeInserted', function(e) {
        if ($(e.target).hasClass('tab-pane')) {
            console.log('🆕 检测到新的标签页创建');
            setTimeout(function() {
                // 为新创建的按钮绑定事件
                $(e.target).find('button:contains("AI 增强分析")').off('click').on('click', function() {
                    console.log('🚀 新标签页的 AI 增强分析按钮被点击');
                    var dumpId = $(e.target).attr('id');
                    if (dumpId && typeof executeAnalysis === 'function') {
                        executeAnalysis(dumpId);
                    }
                });
            }, 100);
        }
    });
});

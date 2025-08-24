// 修复分析按钮事件绑定
$(document).ready(function() {
    console.log('🔧 修复分析按钮事件绑定...');
    
    // 重写 addDump 函数以确保正确的事件绑定
    if (typeof window.addDump === 'function') {
        var originalAddDump = window.addDump;
        
        window.addDump = function(focusTab) {
            console.log('🆕 创建新的分析标签页...');
            
            // 调用原始函数
            var result = originalAddDump.call(this, focusTab);
            
            // 延迟绑定事件，确保DOM已更新
            setTimeout(function() {
                // 找到最新创建的标签页
                var latestTab = $('.tab-pane[data-dumpid^="tda_"]:last');
                if (latestTab.length > 0) {
                    var dumpId = latestTab.attr('data-dumpid');
                    console.log('🎯 为标签页绑定事件:', dumpId);
                    
                    // 确保按钮事件正确绑定
                    var button = latestTab.find('form button');
                    if (button.length > 0) {
                        button.off('click').on('click', function(e) {
                            e.preventDefault();
                            console.log('🚀 分析按钮被点击，ID:', dumpId);
                            
                            if (typeof executeAnalysis === 'function') {
                                executeAnalysis(dumpId);
                            } else {
                                console.error('❌ executeAnalysis 函数不存在');
                            }
                        });
                        
                        console.log('✅ 按钮事件绑定成功');
                    } else {
                        console.warn('⚠️ 未找到分析按钮');
                    }
                }
            }, 100);
            
            return result;
        };
        
        console.log('✅ addDump 函数已增强');
    } else {
        console.warn('⚠️ addDump 函数不存在，使用备用方案');
        
        // 备用方案：直接监听按钮点击
        $(document).on('click', 'button:contains("AI 增强分析"), button:contains("Analyze")', function(e) {
            e.preventDefault();
            console.log('🚀 备用方案：分析按钮被点击');
            
            var tabPane = $(this).closest('.tab-pane');
            var dumpId = tabPane.attr('data-dumpid') || tabPane.attr('id');
            
            console.log('📋 分析 ID:', dumpId);
            
            if (dumpId && typeof executeAnalysis === 'function') {
                executeAnalysis(dumpId);
            } else {
                console.error('❌ 无法执行分析:', {
                    dumpId: dumpId,
                    hasExecuteAnalysis: typeof executeAnalysis === 'function'
                });
            }
        });
    }
    
    // 监听 adddump 按钮点击
    $(document).on('click', '#adddump', function() {
        console.log('➕ Add dump 按钮被点击');
    });
    
    console.log('🔧 按钮修复脚本加载完成');
});

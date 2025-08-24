// 修复标签页功能
$(document).ready(function() {
    console.log('🔧 修复标签页功能...');
    
    // 确保 removeDump 函数存在
    if (typeof window.removeDump !== 'function') {
        window.removeDump = function() {
            var tabId = $(this).parent().attr('data-dumpid');
            console.log('🗑️ 关闭标签页:', tabId);
            
            // 移除标签页
            $('li[data-dumpid="' + tabId + '"]').remove();
            
            // 移除内容
            $('#' + tabId + '_dump').remove();
            
            // 删除分析数据
            if (typeof dumpAnalysis !== 'undefined' && dumpAnalysis[tabId]) {
                delete dumpAnalysis[tabId];
            }
            
            // 如果没有其他标签页，激活 About 标签
            if ($('#dumptabs li[data-dumpid]').length === 0) {
                $('#dumptabs a[href="#about"]').tab('show');
            } else {
                // 激活第一个可用的标签页
                $('#dumptabs li[data-dumpid]:first a').tab('show');
            }
            
            return false;
        };
    }
    
    // 重写 addDump 函数以确保正确的标签页结构
    if (typeof window.addDump === 'function') {
        var originalAddDump = window.addDump;
        
        window.addDump = function(focusTab) {
            console.log('➕ 创建新的标签页...');
            
            // 调用原始函数
            var result = originalAddDump.call(this, focusTab);
            
            // 延迟修复，确保DOM已更新
            setTimeout(function() {
                // 找到最新创建的标签页
                var latestTab = $('li[data-dumpid]:last');
                if (latestTab.length > 0) {
                    var dumpId = latestTab.attr('data-dumpid');
                    console.log('🎯 修复标签页:', dumpId);
                    
                    // 确保关闭按钮事件绑定
                    latestTab.find('.glyphicon-remove').off('click').on('click', window.removeDump);
                    
                    // 确保分析按钮事件绑定
                    var analysisButton = $('#' + dumpId + '_dump').find('form button');
                    if (analysisButton.length > 0) {
                        analysisButton.off('click').on('click', function(e) {
                            e.preventDefault();
                            console.log('🚀 执行分析:', dumpId);
                            if (typeof executeAnalysis === 'function') {
                                executeAnalysis(dumpId);
                            }
                        });
                    }
                    
                    // 激活新创建的标签页
                    if (focusTab !== false) {
                        latestTab.find('a').tab('show');
                    }
                    
                    console.log('✅ 标签页修复完成');
                }
            }, 100);
            
            return result;
        };
        
        console.log('✅ addDump 函数已增强');
    }
    
    // 修复现有标签页的关闭按钮
    $(document).on('click', '.glyphicon-remove', window.removeDump);
    
    // 确保 Add dump 按钮正常工作
    $(document).on('click', '#adddump', function(e) {
        e.preventDefault();
        console.log('➕ Add dump 按钮被点击');
        if (typeof addDump === 'function') {
            addDump(true);
        }
        return false;
    });
    
    console.log('🔧 标签页功能修复完成');
});

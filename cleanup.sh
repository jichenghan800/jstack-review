#!/bin/bash
# Java Thread Dump Analyzer - 清理脚本
# 完全清理所有安装文件和服务
# curl -fsSL https://raw.githubusercontent.com/jichenghan800/jstack-review/gh-pages/cleanup.sh | bash

echo "🧹 Java Thread Dump Analyzer - 完全清理"
echo "========================================"

# 适配root用户
if [[ $EUID -eq 0 ]]; then
    INSTALL_DIR="/opt/jstack-review"
else
    INSTALL_DIR="$HOME/jstack-review"
fi

echo "📁 清理目录: $INSTALL_DIR"
echo ""

# 停止所有相关进程
echo "🛑 停止服务..."
pkill -f "http.server 8080" > /dev/null 2>&1 || true
pkill -f "python.*http.server.*8080" > /dev/null 2>&1 || true
pkill -f "bedrock-test-server" > /dev/null 2>&1 || true
pkill -f "node.*bedrock" > /dev/null 2>&1 || true
echo "✅ 服务已停止"

# 删除systemd服务
if [ -f "/etc/systemd/system/jstack-analyzer.service" ]; then
    echo "🗑️ 删除系统服务..."
    systemctl stop jstack-analyzer > /dev/null 2>&1 || true
    systemctl disable jstack-analyzer > /dev/null 2>&1 || true
    rm -f /etc/systemd/system/jstack-analyzer.service
    systemctl daemon-reload > /dev/null 2>&1 || true
    echo "✅ 系统服务已删除"
fi

# 删除安装目录
if [ -d "$INSTALL_DIR" ]; then
    echo "📂 删除安装目录..."
    rm -rf "$INSTALL_DIR"
    echo "✅ 安装目录已删除"
fi

# 删除备份目录
for backup_dir in "$INSTALL_DIR.backup" "$INSTALL_DIR.old" "${INSTALL_DIR%/*}/jstack-review.backup"; do
    if [ -d "$backup_dir" ]; then
        echo "📂 删除备份目录 $(basename $backup_dir)..."
        rm -rf "$backup_dir"
        echo "✅ 备份目录已删除"
    fi
done

# 清理npm缓存
if command -v npm &> /dev/null; then
    echo "🗑️ 清理npm缓存..."
    npm cache clean --force > /dev/null 2>&1 || true
    echo "✅ npm缓存已清理"
fi

# 清理临时文件
echo "🗑️ 清理临时文件..."
rm -rf /tmp/jstack-* > /dev/null 2>&1 || true
rm -rf /tmp/awscliv2.zip > /dev/null 2>&1 || true
rm -rf /tmp/aws > /dev/null 2>&1 || true
echo "✅ 临时文件已清理"

# 清理防火墙规则 (可选)
if command -v ufw &> /dev/null; then
    echo "🔥 清理防火墙规则..."
    ufw --force delete allow 8080/tcp > /dev/null 2>&1 || true
    ufw --force delete allow 3002/tcp > /dev/null 2>&1 || true
    echo "✅ 防火墙规则已清理"
fi

echo ""
echo "🎉 清理完成！"
echo ""
echo "📋 已清理的内容:"
echo "  ✅ 所有相关进程"
echo "  ✅ 系统服务"
echo "  ✅ 安装目录和备份"
echo "  ✅ npm缓存"
echo "  ✅ 临时文件"
echo "  ✅ 防火墙规则"
echo ""
echo "🔄 重新安装:"
echo "curl -fsSL https://raw.githubusercontent.com/jichenghan800/jstack-review/gh-pages/install.sh | bash"
echo ""

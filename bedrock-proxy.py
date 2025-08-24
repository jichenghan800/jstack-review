#!/usr/bin/env python3
"""
AWS Bedrock Proxy Server for Java Thread Dump Analyzer
Copyright 2025 - Proxy server to handle AWS Bedrock requests from browser
"""

import json
import boto3
import logging
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading
import time

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class BedrockProxyHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """处理 CORS 预检请求"""
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

    def do_POST(self):
        """处理 POST 请求"""
        if self.path == '/api/bedrock-proxy':
            self.handle_bedrock_request()
        else:
            self.send_error(404, "Not Found")

    def do_GET(self):
        """处理 GET 请求"""
        if self.path == '/api/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"status": "healthy", "service": "bedrock-proxy"}).encode())
        else:
            self.send_error(404, "Not Found")

    def handle_bedrock_request(self):
        """处理 AWS Bedrock 请求"""
        try:
            # 读取请求体
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode('utf-8'))
            
            # 提取配置和请求体
            config = request_data.get('config', {})
            body = request_data.get('body', {})
            
            logger.info(f"收到 Bedrock 请求，模型: {config.get('modelId', 'unknown')}")
            
            # 创建 Bedrock 客户端
            session = boto3.Session(
                aws_access_key_id=config.get('accessKeyId'),
                aws_secret_access_key=config.get('secretAccessKey'),
                aws_session_token=config.get('sessionToken'),
                region_name=config.get('region', 'us-east-1')
            )
            
            bedrock_runtime = session.client('bedrock-runtime')
            
            # 调用 Bedrock
            response = bedrock_runtime.invoke_model(
                modelId=config.get('modelId', 'anthropic.claude-3-5-sonnet-20241022-v2:0'),
                body=json.dumps(body),
                contentType='application/json',
                accept='application/json'
            )
            
            # 解析响应
            response_body = json.loads(response['body'].read())
            
            # 返回成功响应
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(response_body).encode())
            
            logger.info("Bedrock 请求处理成功")
            
        except Exception as e:
            logger.error(f"处理 Bedrock 请求失败: {str(e)}")
            self.send_error(500, f"Internal Server Error: {str(e)}")

    def send_cors_headers(self):
        """发送 CORS 头"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    def log_message(self, format, *args):
        """自定义日志格式"""
        logger.info(f"{self.address_string()} - {format % args}")

def run_proxy_server(port=8081):
    """运行代理服务器"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, BedrockProxyHandler)
    
    logger.info(f"🚀 AWS Bedrock 代理服务器启动在端口 {port}")
    logger.info(f"📍 健康检查: http://localhost:{port}/api/health")
    logger.info(f"🔗 代理端点: http://localhost:{port}/api/bedrock-proxy")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        logger.info("🛑 服务器停止")
        httpd.shutdown()

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='AWS Bedrock Proxy Server')
    parser.add_argument('--port', type=int, default=8081, help='服务器端口 (默认: 8081)')
    args = parser.parse_args()
    
    # 检查 boto3 是否可用
    try:
        import boto3
        logger.info("✅ boto3 已安装")
    except ImportError:
        logger.error("❌ 请安装 boto3: pip install boto3")
        exit(1)
    
    run_proxy_server(args.port)

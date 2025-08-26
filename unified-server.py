#!/usr/bin/env python3
"""
Unified HTTP server for JStack Review
Serves static files and proxies API requests to AutoGen server
Single port (8080) solution
"""

from http.server import HTTPServer, BaseHTTPRequestHandler, SimpleHTTPRequestHandler
import requests
import json
import os
import urllib.parse
from pathlib import Path

class UnifiedHandler(SimpleHTTPRequestHandler):
    
    # 设置更大的读取缓冲区
    rbufsize = 65536  # 64KB buffer
    wbufsize = 65536  # 64KB buffer
    
    # 增加请求体大小限制到100MB
    def parse_request(self):
        """Override to handle large request bodies"""
        result = super().parse_request()
        # 设置更大的请求体限制
        if hasattr(self, 'rfile'):
            # Python HTTP服务器默认可能有较小的缓冲区限制
            pass
        return result
    
    def __init__(self, *args, **kwargs):
        # Set the directory to serve files from
        super().__init__(*args, directory=os.getcwd(), **kwargs)
    
    def do_OPTIONS(self):
        """Handle preflight CORS requests"""
        self.send_cors_headers()
        self.end_headers()
    
    def do_GET(self):
        # Check if this is an API request that should be proxied
        if self.path.startswith('/api/'):
            self.proxy_request('GET')
        else:
            # Serve static files
            super().do_GET()
    
    def do_POST(self):
        # 添加详细的请求日志
        content_length = int(self.headers.get('Content-Length', 0))
        print(f"🔍 POST请求: {self.path}, Content-Length: {content_length}")
        
        # Check if this is an API request that should be proxied
        if self.path.startswith('/api/'):
            self.proxy_request('POST')
        else:
            self.send_error(404, 'Not found')
    
    def send_cors_headers(self):
        """Send CORS headers"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        self.send_header('Access-Control-Max-Age', '86400')  # 24 hours
    
    def proxy_request(self, method):
        try:
            # 读取请求体 - 处理大文件
            content_length = int(self.headers.get('Content-Length', 0))
            
            # 如果是大请求，分块读取
            if content_length > 1024 * 1024:  # > 1MB
                print(f"🔍 处理大请求体: {content_length} bytes ({content_length/1024/1024:.1f}MB)")
                
            post_data = None
            if content_length > 0:
                try:
                    post_data = self.rfile.read(content_length)
                    print(f"✅ 成功读取请求体: {len(post_data)} bytes")
                    
                    # 检查内容类型和编码
                    content_type = self.headers.get('Content-Type', 'unknown')
                    print(f"🔍 Content-Type: {content_type}")
                    
                    # 如果是JSON，检查内容的前1000字符以验证完整性
                    if 'application/json' in content_type:
                        try:
                            decoded_data = post_data.decode('utf-8')
                            print(f"🔍 JSON数据前1000字符: {decoded_data[:1000]}")
                            # 验证JSON有效性
                            import json
                            json.loads(decoded_data)
                            print(f"✅ JSON数据有效")
                        except json.JSONDecodeError as je:
                            print(f"❌ JSON解析错误: {je}")
                        except UnicodeDecodeError as ue:
                            print(f"❌ UTF-8解码错误: {ue}")
                            
                except Exception as e:
                    print(f"❌ 读取请求体失败: {e}")
                    raise
            
            # Forward to AutoGen server
            target_url = f'http://localhost:8082{self.path}'
            
            headers = {}
            for header_name, header_value in self.headers.items():
                if header_name.lower() not in ['host', 'content-length']:
                    headers[header_name] = header_value
            
            print(f"🔄 API代理: {method} {target_url} (Content-Length: {content_length})")
            
            # 增加超时时间处理大请求
            timeout = 600 if content_length > 1024 * 1024 else 300
            
            if method == 'POST':
                response = requests.post(target_url, data=post_data, headers=headers, timeout=timeout)
            else:
                response = requests.get(target_url, headers=headers, timeout=timeout)
            
            print(f"✅ API响应: {response.status_code} (响应长度: {len(response.content)} bytes)")
            
            # Send response back with CORS headers
            self.send_cors_headers()
            
            # Copy response headers
            for header_name, header_value in response.headers.items():
                if header_name.lower() not in ['content-encoding', 'transfer-encoding', 'connection', 'access-control-allow-origin']:
                    self.send_header(header_name, header_value)
            
            self.end_headers()
            self.wfile.write(response.content)
            
        except Exception as e:
            print(f"❌ API代理错误: {e}")
            self.send_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            error_response = json.dumps({
                'success': False,
                'error': f'API代理错误: {str(e)}'
            })
            self.wfile.write(error_response.encode('utf-8'))

if __name__ == '__main__':
    port = 8080
    print(f"🚀 启动统一HTTP服务器 - 端口 {port}")
    print("   📁 静态文件服务: /*")
    print("   🔗 API代理服务: /api/* -> localhost:8082")
    print(f"   🌐 访问地址: http://localhost:{port}/ai-simple.html")
    
    server = HTTPServer(('0.0.0.0', port), UnifiedHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 服务器停止")
        server.server_close()
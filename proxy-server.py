#!/usr/bin/env python3
"""
Simple HTTP proxy server to forward requests from port 8080 to AutoGen server on port 8082
This works around cloud server networking restrictions
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import requests
import json
import urllib.parse

class ProxyHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle preflight CORS requests"""
        self.send_cors_headers()
        self.end_headers()
    
    def do_POST(self):
        # Check if this is an API request that should be proxied
        if self.path.startswith('/api/'):
            self.proxy_request('POST')
        else:
            self.send_error(404, 'Not found')
    
    def do_GET(self):
        # Check if this is an API request that should be proxied
        if self.path.startswith('/api/'):
            self.proxy_request('GET')
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
            # Read the request body
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length) if content_length > 0 else None
            
            # Forward to AutoGen server
            target_url = f'http://localhost:8082{self.path}'
            
            headers = {}
            for header_name, header_value in self.headers.items():
                if header_name.lower() not in ['host', 'content-length']:
                    headers[header_name] = header_value
            
            print(f"🔄 代理请求: {method} {target_url}")
            
            if method == 'POST':
                response = requests.post(target_url, data=post_data, headers=headers, timeout=300)
            else:
                response = requests.get(target_url, headers=headers, timeout=300)
            
            print(f"✅ 代理响应: {response.status_code}")
            
            # Send response back with CORS headers
            self.send_cors_headers()
            
            # Copy response headers (except CORS ones that we already set)
            for header_name, header_value in response.headers.items():
                if header_name.lower() not in ['content-encoding', 'transfer-encoding', 'connection', 'access-control-allow-origin']:
                    self.send_header(header_name, header_value)
            
            self.end_headers()
            self.wfile.write(response.content)
            
        except Exception as e:
            print(f"❌ 代理错误: {e}")
            self.send_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            error_response = json.dumps({
                'success': False,
                'error': f'代理服务器错误: {str(e)}'
            })
            self.wfile.write(error_response.encode('utf-8'))

if __name__ == '__main__':
    print("🚀 Starting API proxy server on port 8081...")
    print("   Proxying /api/* requests to localhost:8082")
    server = HTTPServer(('0.0.0.0', 8081), ProxyHandler)
    server.serve_forever()
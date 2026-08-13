import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
import json

LOG_FILE_PATH = r"C:\Negar_Web_C\eshkal.txt"

class LogHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        log_text = post_data.decode('utf-8', errors='replace')

        try:
            with open(LOG_FILE_PATH, "w", encoding="utf-8") as f:
                f.write(log_text)
            
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok"}).encode('utf-8'))
        except Exception as e:
            self.send_response(500)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

    def log_message(self, format, *args):
        return

def run_server():
    server_address = ('127.0.0.1', 9999)
    httpd = HTTPServer(server_address, LogHandler)
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()

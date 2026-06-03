import http.server
import urllib.parse

class FormHandler(http.server.BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type")
        self.end_headers()

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'text/html')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(b"OK")

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        with open('wetu_data_raw.json', 'wb') as f:
            f.write(post_data)
        
        self.send_response(200)
        self.send_header('Content-Type', 'text/plain')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(b"OK")
        print("Data saved successfully.")
        import threading
        threading.Thread(target=self.server.shutdown).start()

def run(port=8081):
    server_address = ('', port)
    httpd = http.server.HTTPServer(server_address, FormHandler)
    print("Form server starting on port", port)
    httpd.serve_forever()

if __name__ == "__main__":
    run()

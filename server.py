import http.server
import socketserver

PORT = 8080
Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
    print("Serving at http://127.0.0.1:{}".format(PORT))
    httpd.serve_forever()
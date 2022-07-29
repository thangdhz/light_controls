import http.server as SimpleHTTPServer
import socketserver 

class MyRequestHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.path = '/index.html'
        return SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)

Handler = MyRequestHandler
server = socketserver .TCPServer(('0.0.0.0', 8080), Handler)

server.serve_forever()
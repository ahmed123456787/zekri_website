import http.server
import socketserver
import functools

PORT = 8000
DIRECTORY = "D:/zekri-clinic"

# Clean URLs -> real files (e.g. /appointments serves appointments.html)
REWRITES = {
    "/appointments": "/appointments.html",
    "/doctors": "/doctors.html",
}


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def translate_path(self, path):
        clean = path.split("?", 1)[0].split("#", 1)[0].rstrip("/")
        if clean in REWRITES:
            path = REWRITES[clean]
        return super().translate_path(path)


handler = functools.partial(NoCacheHandler, directory=DIRECTORY)

with socketserver.ThreadingTCPServer(("0.0.0.0", PORT), handler) as httpd:
    httpd.allow_reuse_address = True
    print("Serving %s on 0.0.0.0:%d  (no-cache, clean URLs)" % (DIRECTORY, PORT))
    httpd.serve_forever()

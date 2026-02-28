#!/usr/bin/env python3
"""
HTTPS server for Quest 3 AR with WebXR support
Serves on port 5500 with self-signed certificate
"""
import http.server
import ssl
import os
import sys

# Change to project directory (same directory as this script)
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Server configuration
PORT = 5500
CERT_FILE = 'cert.pem'
KEY_FILE = 'key.pem'

# Verify certificate files exist
if not os.path.exists(CERT_FILE) or not os.path.exists(KEY_FILE):
    print(f"Error: Certificate files not found!")
    print(f"   Looking for: {CERT_FILE} and {KEY_FILE}")
    sys.exit(1)

# Create HTTP server with custom handler for better logging
class LoggingHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        print(f"{self.address_string()} - {format % args}")

server_address = ('0.0.0.0', PORT)
httpd = http.server.HTTPServer(server_address, LoggingHTTPRequestHandler)

# Wrap with SSL - using more permissive settings for Quest compatibility
context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.check_hostname = False
context.verify_mode = ssl.CERT_NONE
context.load_cert_chain(CERT_FILE, KEY_FILE)
httpd.socket = context.wrap_socket(httpd.socket, server_side=True)

print(f"""
╔════════════════════════════════════════════════════════════╗
║  ClearPath HTTPS Server Running                           ║
╚════════════════════════════════════════════════════════════╝

Access on Quest 3:  https://172.22.53.62:{PORT}/index.html

IMPORTANT: You'll see a certificate warning on Quest
    Click "Advanced" → "Proceed Anyway" to continue

Using self-signed certificate (valid for 365 days)
Serving from: {os.getcwd()}
Listening on all interfaces (0.0.0.0:{PORT})

Press Ctrl+C to stop server
""")

try:
    httpd.serve_forever()
except KeyboardInterrupt:
    print("\n\nServer stopped")
    httpd.shutdown()
except Exception as e:
    print(f"\nServer error: {e}")
    sys.exit(1)

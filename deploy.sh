#!/bin/bash
# ClearPath AR - Quick Deployment Script
# Run this script to start the local HTTPS server and open the app
#
# IMPORTANT: HTTPS is required for microphone access on the Quest 3.
# Plain HTTP will silently block getUserMedia() and SpeechRecognition
# on any non-localhost origin.

set -e
cd "$(dirname "$0")"

echo "Starting ClearPath AR deployment..."

# Generate self-signed certificate if missing
if [ ! -f cert.pem ] || [ ! -f key.pem ]; then
    echo "Generating self-signed SSL certificate..."
    if command -v openssl &> /dev/null; then
        openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem \
            -days 365 -nodes -subj "/CN=ClearPath-AR" 2>/dev/null
        echo "Certificate generated."
    else
        echo "ERROR: openssl not found. Install it to generate certificates."
        exit 1
    fi
fi

# Get local IP address
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

echo ""
echo "Access URLs (HTTPS required for microphone):"
echo "   Local:   https://localhost:5500"
echo "   Network: https://$LOCAL_IP:5500"
echo ""
echo "For Meta Quest 3:"
echo "   Main App: https://$LOCAL_IP:5500/index.html"
echo ""
echo "NOTE: You will see a certificate warning - click Advanced -> Proceed to continue."
echo "Press Ctrl+C to stop the server"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Start HTTPS server
if command -v python3 &> /dev/null; then
    python3 start-https-server.py
else
    echo "ERROR: Python 3 is required to run the HTTPS server."
    echo "Install it from https://python.org/downloads/"
    exit 1
fi
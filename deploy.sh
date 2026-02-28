#!/bin/bash
# ClearPath AR - Quick Deployment Script
# Run this script to start the local server and open the app

echo "🚀 Starting ClearPath AR deployment..."

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    echo "✅ Python 3 found - starting HTTP server on port 8000"
    
    # Get local IP address
    LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
    
    echo "📱 Access URLs:"
    echo "   Local: http://localhost:8000"
    echo "   Network: http://$LOCAL_IP:8000"
    echo ""
    echo "🥽 For Meta Quest 3:"
    echo "   Setup Page: http://$LOCAL_IP:8000/setup.html"
    echo "   Main App: http://$LOCAL_IP:8000/index.html"
    echo ""
    echo "⏹️  Press Ctrl+C to stop the server"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Start Python HTTP server
    python3 -m http.server 8000
    
elif command -v node &> /dev/null && command -v npx &> /dev/null; then
    echo "✅ Node.js found - installing and starting http-server"
    npx http-server . -p 8000 -c-1
    
else
    echo "❌ Neither Python 3 nor Node.js found"
    echo "Please install one of the following:"
    echo "  • Python 3: https://python.org/downloads/"
    echo "  • Node.js: https://nodejs.org/"
    echo ""
    echo "Alternative: Use VS Code Live Server extension"
fi
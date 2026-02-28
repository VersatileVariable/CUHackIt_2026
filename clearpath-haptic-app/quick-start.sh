#!/bin/bash
# Quick start script for ClearPath haptic app

echo "ClearPath Haptic App - Quick Start"
echo ""

# Check if we're in the right directory
if [ ! -f "App.js" ]; then
    echo "Error: Run this script from clearpath-haptic-app/ directory"
    echo "   cd clearpath-haptic-app && ./quick-start.sh"
    exit 1
fi

# Get laptop IP
echo "Finding your laptop's IP address..."
LAPTOP_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

if [ -z "$LAPTOP_IP" ]; then
    echo "Could not automatically detect IP address"
    echo "   Please find it manually and update App.js"
else
    echo "Found IP: $LAPTOP_IP"
    echo ""
    echo "Update App.js line 5 with this IP:"
    echo "   const LAPTOP_IP = '$LAPTOP_IP';"
    echo ""
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo ""
fi

echo "Starting Expo development server..."
echo ""
echo "Next steps:"
echo "   1. Scan QR code with iPhone Camera app"
echo "   2. App will open in Expo Go"
echo "   3. Make sure bridge server is running (npm start in main directory)"
echo ""

npx expo start

#!/bin/bash
# ClearPath AR - Vercel Deployment Script
# Quick deployment to Vercel with HTTPS for Quest 3 compatibility

echo "ClearPath AR - Vercel Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "This will deploy ClearPath to Vercel with automatic HTTPS"
echo "   HTTPS is required for microphone permissions on Meta Quest 3"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI not found"
    echo ""
    echo "Installing Vercel CLI..."
    
    if command -v npm &> /dev/null; then
        npm install -g vercel
        echo "Vercel CLI installed"
    else
        echo "npm not found. Please install Node.js first:"
        echo "   macOS: brew install node"
        echo "   Or download: https://nodejs.org/"
        exit 1
    fi
fi

echo "Vercel CLI is ready"
echo ""

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "Please login to Vercel..."
    echo "   This will open your browser for authentication"
    echo ""
    vercel login
    
    if [ $? -ne 0 ]; then
        echo "Login failed"
        exit 1
    fi
fi

echo "Logged in to Vercel"
echo ""

# Ask for deployment type
echo "Choose deployment option:"
echo "  1) Production (recommended for demo)"
echo "  2) Preview (for testing)"
echo ""
read -p "Enter choice (1 or 2): " choice

case $choice in
    1)
        echo ""
        echo "Deploying to PRODUCTION..."
        echo "   You'll get a permanent HTTPS URL for your Quest 3"
        echo ""
        vercel --prod
        ;;
    2)
        echo ""
        echo "Deploying to PREVIEW..."
        echo "   You'll get a temporary HTTPS URL for testing"
        echo ""
        vercel
        ;;
    *)
        echo "Invalid choice. Run script again."
        exit 1
        ;;
esac

# Check if deployment succeeded
if [ $? -eq 0 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "DEPLOYMENT SUCCESSFUL!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Next Steps for Meta Quest 3:"
    echo "   1. Open Quest Browser"
    echo "   2. Navigate to the URL shown above (https://...)"
    echo "   3. Click 'Start Speech Recognition'"
    echo "   4. Allow microphone when prompted"
    echo "   5. Enjoy live captions!"
    echo ""
    echo "Tip: Bookmark the URL on your Quest for easy access"
    echo ""
else
    echo ""
    echo "Deployment failed"
    echo "   Run 'vercel --debug' for more information"
    echo ""
    exit 1
fi
